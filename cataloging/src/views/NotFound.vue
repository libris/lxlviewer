<script>
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'NotFound',
  methods: {
    translatePhrase,
  },
};
</script>

<template>
  <article class="panel panel-default Article">
    <div class="Article-content">
      <header class="Article-header">
        <h1 class="Article-title">{{ translatePhrase('The page was not found') }} <span class="error-code">(404)</span></h1>
        <div class="abstract Article-abstract">
          <router-link to="/">{{ translatePhrase('Back to home page') }}</router-link>
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
}
</style>
