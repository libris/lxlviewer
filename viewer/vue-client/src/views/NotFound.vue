<script>

export default {
  name: 'NotFound',
  computed: {
  },
};
</script>

<template>
  <article class="panel panel-default Article">
    <div class="Article-content">
      <header class="Article-header">
        <h1 class="Article-title">{{ 'The page was not found' | translatePhrase }} <span class="error-code">(404)</span></h1>
        <div class="abstract Article-abstract">
          <router-link to="/">{{ 'Back to home page' | translatePhrase }}</router-link>
        </div>
      </header>
    </div>
  </article>
</template>

<style lang="less">

.Article {
  margin-top: 15vh;

  &-featuredImg {
    width: 100%;
  }

  &-title {
    font-size: 48px;
    font-size: 4.8rem;
    font-weight: 500;
  }

  &-abstract {
    font-size: 2px;
    font-size: 2rem;
    font-weight: 700;
  }

  &-content {
    padding: 2em 5em 4em;
  }

  &-section {
    margin: 0 0 2em;
  }

  &-sectionTitle {
    // font-size: 20px;
    // font-size: 2.0rem;
  }
}
</style>
