import store from '@/store';

const lang = store.getters.settings.language;

export const formatDate = (date) => {
  const dateObj = new Date(date);

  if (dateObj instanceof Date) {
    return new Intl.DateTimeFormat(lang).format(new Date(date));
  } return null;
};

export const formatDateTime = (date) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const dateObj = (date && new Date(date)) || new Date();

  if (dateObj instanceof Date) {
    const result = new Intl.DateTimeFormat(lang, options).format(dateObj);
    return result;
  } return null;
};

export const getRelativeTime = (date) => {
  const inputDate = new Date(date);

  if (inputDate instanceof Date) {
    const formatter = new Intl.RelativeTimeFormat(lang, { style: 'long', numeric: 'auto' });
    const divisions = [
      { amount: 60, name: 'seconds' },
      { amount: 60, name: 'minutes' },
      { amount: 24, name: 'hours' },
      { amount: 7, name: 'days' },
      { amount: 4.34524, name: 'weeks' },
      { amount: 12, name: 'months' },
      { amount: Number.POSITIVE_INFINITY, name: 'years' },
    ];
    const nowDate = new Date();
    let duration = (inputDate - nowDate) / 1000; // convert duration from milliseconds to seconds

    for (let i = 0; i < divisions.length; i++) { // loop through divisions
      const division = divisions[i];
      if (Math.abs(duration) < division.amount) {
        // we have reached largest division possible for current duration
        return formatter.format(Math.round(duration), division.name);
      }
      duration /= division.amount;
    }
  } else {
    return null;
  }
  return null;
};
