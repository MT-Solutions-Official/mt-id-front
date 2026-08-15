export function appMembership(app, ownerId) {
  return (app?.owners || []).find((item) => item.ownerId === ownerId)
}

export function isAppWriter(app, ownerId) {
  return appMembership(app, ownerId)?.role === 'OWNER_WRITER'
}

export function appRoleLabel(role) {
  if (role === 'OWNER_WRITER') return 'Writer'
  if (role === 'OWNER_VIEWER') return 'Viewer'
  return 'Viewer'
}
