<script>
import moment from 'moment';
import * as StringUtil from '@/utils/string';
import { mapGetters } from 'vuex';

export default {
  name: 'blog-panel',
  props: [
    "image",
    "linkUrl",
    "linkText",
    "header",
    "text",
    "html",
  ],
  data() {
    return {
      feed: null,
    }
  },
  methods: {
    getFeed() {
      fetch(`${this.settings.apiPath}/blogfeed`).then((result) => {
        if (result.status == 200) {
          result.json().then((body) => {
            this.feed = body;
          });
        }
      }, (error) => {
        console.log(error);
      });
    },
    getTimeAgoString(date) {
      const today = moment().startOf('day');
      if (today.isSame(date, 'day')) {
        return StringUtil.getUiPhraseByLang('Today', this.user.settings.language).toLowerCase();
      }
      return moment(date, "YYYY-MM-DD").from(moment().startOf('day'));
    },
  },
  computed: {
    ...mapGetters([
      'user',
      'settings',
    ]),
    resolvedImage() {
      return require(`@/assets/img/${this.image}`)
    },
  },
  components: {
  },
  watch: {
  },
  mounted() { 
    this.$nextTick(() => {
      this.getFeed();
    });
  },
};
</script>


<template>
  <div class="panel panel-default BlogPanel">
    <img v-if="image" :src="resolvedImage" class="LinkCard-img"/>
    <div class="BlogPanel-content card-content" v-if="feed !== null">
      <span class="BlogPanel-title card-title">{{ header }}</span>
      <div class="BlogPanel-postList">
        <div class="BlogPanel-post" v-for="post in feed" :key="post.id">
          <a :href="post.link">{{ post.title.rendered }}</a>
          <span class="date">{{ 'Posted' | translatePhrase }} {{ getTimeAgoString(post.date) }}</span>
        </div>
      </div>
    </div>
    <div class="BlogPanel-content card-content" v-if="feed === null">
      <div class="BlogPanel-text card-text">
        <span class="BlogPanel-title card-title">{{ header }}</span>
        <div v-if="html" class="BlogPanel-html card-descr" v-html="html">{{ html }}</div>
        <div class="BlogPanel-descr card-descr">{{ text }}</div>
      </div>
      <a v-if="linkUrl" :href="linkUrl" class="card-link BlogPanel-link">{{ linkText }}</a>
    </div>
  </div>
</template>

<style lang="less">
.BlogPanel {
  flex-basis: 100%; // To parent
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;

  @media (min-width: 768px) {
    flex-basis: 49%; 
  }

  @media (min-width: 992px) {
    flex-basis: 24%; 
  }

  &-postList {
    flex-grow: 1;
  }
  &-post {
    padding: 0 0.5em 0 0.5em;
    width: 100%;
    a {
      font-weight: 600;
      display: block;
      font-size: 11pt;
    }
    .date {
      font-size: 10pt;
      width: 100%;
      display: block;
    }
  }

  &-img {
    width: 100%;
    flex-shrink: 0; // Prevent weird image sizing behaviour in IE11
    border: solid #f1f1f1;
    border-width: 0px 0px 1px 0px;
  }

  &-content {
    .LinkCard--large & {
      padding: 1em;
      @media (min-width: 768px) {
        flex-basis: 45%;
      }
    }
  }

  &-link {
  }

  &-text {
  }

  &-descr,
  &-html {
    @media (min-width: 768px) {
      display: flex;
    }
  }

  &-html {
    display: block;
  }

  &-title {
  }

  &.no-link {
    padding-bottom: 1em;
  }

  &--large {
    display: block;
    justify-content: space-between;
    flex-direction: row;
    align-items: inherit;

    @media (min-width: 768px) {
      display: flex;
    }
  }
}
</style>
