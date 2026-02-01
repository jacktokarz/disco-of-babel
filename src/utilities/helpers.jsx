export function filterOutRoles(joinModalData, roleOptions) {
  const remainingRoles = [];
  roleOptions.map((role) => {
    if(joinModalData[role] === false) {
      remainingRoles.push(role);
    }
  });
  return remainingRoles;
}

export function checkIfReady(game) {
  return (game.horse && game.cat && game.pigeon && game.rat);
}