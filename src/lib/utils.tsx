export function alertError(data) {
  if (data.status !== undefined) {
    switch (data.status) {
      case 413:
        alert('La dimensione massima accettata è di 1MB');
        break;
      case 500:
        alert('Errore nel Server');
        break;
      default:
        alert(data.msg);
        break;
    }
  }
}

export function pretty_number(number) {
  if (!number) {
    return '-';
  }
  return number.toFixed(2);
}

export function showTime(old: number) {
  let d = new Date(Date.now() - old * 1000);
  let data = {
    anni: d.getFullYear() - 1970, // anno zero
    mesi: d.getMonth(), // mese Gennaio=0
    giorni: Math.round(d.getTime() / 1000 / 60 / 60 / 24),
    ore: Math.round(d.getTime() / 1000 / 60 / 60),
    min: Math.round(d.getTime() / 1000 / 60),
  };
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      if (element > 0) {
        return '> ' + element + ' ' + key;
      }
    }
  }
  return '< 1 min';
}
