// This handles marc-paths,
// They are defined as '/marc/termName'
// But they need to be handled as '/vocab/marc:termName'

export default function ({ route, redirect }) {
  if (route.path.startsWith('/marc/')) {
    const newPath = route.path.replace('/marc/', '/vocab/marc:');
    return redirect(newPath);
  }
}
