<script>
import { convertResourceLink } from '@/utils/filters';

export default {
  name: 'link-card',
  props: [
    'videoUrl',
    'image',
    'linkUrl',
    'linkText',
    'imageAltText',
    'header',
    'text',
    'html',
  ],
  setup(props) {
    return {
      resolvedImage: new URL(`/src/assets/img/${props.image}`, import.meta.url).href,
    };
  },
  data() {
    return {
      keyword: '',
      youtube: {
        accepted: false,
        styling: {
          show: false,
          styling: 'green',
          text: 'button',
        },
      },
    };
  },
  methods: {
    convertResourceLink,
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="panel panel-default LinkCard" v-bind:class="{ 'no-link': !linkUrl, 'LinkCard--large': videoUrl }">
    <img v-if="image" :src="resolvedImage" class="LinkCard-img" :alt="imageAltText" />

    <div v-else-if="videoUrl" class="LinkCard-videoWrap">
      <div
        class="LinkCard-youtubeDialog"
        v-if="videoUrl.indexOf('youtube') > -1 && !youtube.accepted"
        @click="youtube.accepted = true"
        @keyup.enter="youtube.accepted = true"
        tabindex="0">
        <div>
          <p>
            Genom att spela våra instruktionsfilmer godkänner du cookies från YouTube
          </p>
          <i class="fa fa-3x fa-play" />
        </div>
      </div>
      <div class="LinkCard-video Video" v-if="videoUrl.indexOf('youtube') == !-1 || youtube.accepted">
        <iframe :src="videoUrl" allow="autoplay" allowfullscreen :title="header" />
      </div>
    </div>
    <div class="LinkCard-content card-content">
      <div class="LinkCard-text card-text">
        <span class="LinkCard-title card-title">{{ header }}</span>
        <div v-if="html" class="LinkCard-html card-descr" v-html="html" />
        <div class="LinkCard-descr card-descr">{{ text }}</div>
      </div>
      <a v-if="!linkUrl.startsWith('/')" :href="convertResourceLink(linkUrl)" class="card-link LinkCard-link">{{ linkText }}</a>
      <router-link v-if="linkUrl.startsWith('/')" :to="linkUrl" class="card-link LinkCard-link">{{ linkText }}</router-link>
    </div>
  </div>
</template>

<style lang="less">
.LinkCard {
  flex-basis: 100%; // To parent
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;

  @media (min-width: 768px) {
    flex-basis: 49%;
  }

  @media (min-width: 992px) {
    flex-basis: 32%;
  }

  &-img {
    width: 100%;
    flex-shrink: 0; // Prevent weird image sizing behaviour in IE11
    border: solid #f1f1f1;
    border-width: 0px 0px 1px 0px;
  }

  &-youtubeDialog {
    display: flex;
    cursor: pointer;
    background-color: rgb(36, 36, 36);
    color: #ddd;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    margin-bottom: -1px;
    p {
      font-size: 0.8em;
    }
    i {
      &:hover {
        color: rgb(170, 170, 170);
      }
    }
    div {
      flex-grow: 1;
      text-align: center;
    }
  }

  &-videoWrap {
    flex-basis: 100%;
    padding-bottom: 1px;

    @media (min-width: 768px) {
      flex-basis: 45%;
    }
  }

  &-video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    padding-top: 25px;
    height: 0;

    &-iframe,
    & iframe,
    & embed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  }

  &-content {
    .LinkCard--large & {
      padding: 1em;
      @media (min-width: 768px) {
        flex-basis: 45%;
      }
    }
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
