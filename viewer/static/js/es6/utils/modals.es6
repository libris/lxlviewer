export function confirmDialog(title, content) {
  return new Promise((resolve, reject) => {
    // TODO: Create pretty modal
    const accept = confirm(`${title}\n${content}`);

    if (accept) {
      resolve();
    } else {
      reject();
    }
  });
}
