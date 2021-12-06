// This handles marc-paths,
// They are defined as '/marc/termName'
// But they need to be handled as '/vocab/marc:termName'

export default function ({ route, store, redirect }) {
  if (route.path.startsWith('/marc/')) {
    const vocab = store.getters.resources.vocab;
    const termPath = route.path;
    const tryVocabPath = `https://id.kb.se${termPath}`;
    const term = vocab.get(tryVocabPath);
    if (term) {
      const newPath = route.path.replace('/marc/', '/vocab/marc:');
      return redirect(newPath);
    }
  }
}
