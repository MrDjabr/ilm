/* Мост к нативным локальным уведомлениям (Capacitor). В обычном браузере ничего не делает. */
(function () {
  const C = window.Capacitor;
  if (!C || !(C.isNativePlatform && C.isNativePlatform())) return;
  const LN = C.Plugins && C.Plugins.LocalNotifications;
  if (!LN) return;

  const MAX = 60; // iOS хранит не более 64 запланированных уведомлений
  let perm = 'default';

  window.nativePerm = () => perm;
  const refreshPerm = async () => {
    try { const r = await LN.checkPermissions(); perm = r.display === 'granted' ? 'granted' : r.display === 'denied' ? 'denied' : 'default'; } catch (e) {}
  };
  window.nativeAsk = async () => {
    try { await LN.requestPermissions(); } catch (e) {}
    await refreshPerm(); window.nativeSchedule();
  };

  let busy = false;
  window.nativeSchedule = async function () {
    if (busy) return; busy = true;
    try {
      await refreshPerm();
      // 1. Вернуть в очередь ещё не показанные хадисы, чтобы они не пропали из круга
      const queued = store.get('nativeQueue', []);
      const unshown = queued.filter(q => q.at > Date.now()).map(q => q.id);
      if (unshown.length) store.set('bag', [...store.get('bag', []), ...unshown.reverse()]);
      store.set('nativeQueue', []);
      const pending = await LN.getPending();
      if (pending.notifications.length) await LN.cancel({ notifications: pending.notifications });
      if (perm !== 'granted' || !S.on) return;

      // 2. Запланировать ближайшие уведомления по настройкам пользователя
      const items = []; const q = []; let from = new Date();
      for (let i = 0; i < MAX; i++) {
        const t = nextFire(from); if (!t) break;
        const h = byId(nextRandomId()); if (!h) break;
        items.push({
          id: 1000 + i,
          title: h.source ? 'Хадис · ' + h.source : 'Хадис',
          body: h.text.length > 180 ? h.text.slice(0, 177) + '…' : h.text,
          schedule: { at: t, allowWhileIdle: true },
          extra: { id: h.id }
        });
        q.push({ id: h.id, at: t.getTime() });
        from = t;
      }
      if (items.length) await LN.schedule({ notifications: items });
      store.set('nativeQueue', q);
    } catch (e) { console.warn('native schedule', e); }
    finally { busy = false; }
  };

  LN.addListener('localNotificationActionPerformed', ev => {
    const id = ev.notification && ev.notification.extra && ev.notification.extra.id;
    if (id && byId(id)) open_(id);
  });
  refreshPerm().then(() => { window.nativeSchedule(); if (typeof render === 'function') render(); });
})();
