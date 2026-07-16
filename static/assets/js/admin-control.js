(() => {
  const current = new URL(window.location.href);
  if (!current.pathname.startsWith('/admin/dashboard')) return;
  if (current.searchParams.get('portal') === 'ja-plan-studio') return;

  current.pathname = '/admin/dashboard/';
  current.searchParams.set('portal', 'ja-plan-studio');
  current.searchParams.set('release', '20260716-exact-profile-layout');
  window.location.replace(current.toString());
})();
