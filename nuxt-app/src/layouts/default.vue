<template>
  <div class="layout">
    <header class="position-sticky top-0">
      <Navbar />
      <SearchBar />
    </header>
    <main>
      <Nuxt />
    </main>
    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';

export default {
  data() {
    return {
    }
  },
  head() {
    return {
      meta: [
        { hid: 'description', name: 'description', content: 'Grundstenar för länkade data hos Kungliga biblioteket.' },
        { hid:'og:title', property:'og:title', content:'id.kb.se' },
        { hid:'og:site_name', property:'og:site_name', content:'id.kb.se' },
        { hid:'og:description', property:'og:description', content:'Grundstenar för länkade data hos Kungliga biblioteket.' },
        { hid:'og:image', property:'og:image', content:`${this.$defaultHostPath()}/opengraph_id.png` },
        { hid:'twitter:image', property:'twitter:image', content:`${this.$defaultHostPath()}/opengraph_id.png` },
      ]
    }
  },
  computed: {
  },
  methods: {
  },
  props: {
  },
  components: {
    Navbar,
    SearchBar,
    Footer,
  }
}
</script>

<style lang="scss">
html {
  height: 100%;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body {
  height: 100%;
}

:root {
  --site-padding-x: 2rem;
}

.container-fluid {
  @media (min-width: 992px) {
    padding-left: var(--site-padding-x) !important;
    padding-right: var(--site-padding-x) !important;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

header {
  z-index: 999;
}

main {
  flex-grow: 1;
  padding-bottom: 5em;
  background-color: $kb-primary-white;
}
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

footer {

}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
