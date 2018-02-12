<script>
export default {
  name: 'footer-component',
  props: {
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log("keyword changed", value, oldval);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="footer-container">
    <div class="">
      <div class="content-container">
        <div class="service-name">
          <img src="~kungbib-styles/dist/assets/kb_logo_white.svg" class="logo-medium" alt="" />
          <a href="http://www.kb.se" alt="Länk till Kungliga bibliotekets webbplats">
            <span class="brand-text js-translateable" data-translateable="National Library of Sweden">National Library of Sweden</span>
          </a>
        </div>
        <div class="link-list">
          <div class="header" data-translateable="XL">XL</div>
          <div class="item"><router-link to="/about">{{ "About XL" | translatePhrase }}</router-link></div>
          <div class="item"><a href="https://goo.gl/forms/dPxkhMqE10RvKQFE2" class="js-translateable" data-translateable="Suggest change">Suggest change</a></div>
          <div class="item"><a href="https://goo.gl/forms/3mL7jTlEpbU3BQM13" class="js-translateable" data-translateable="Report error">Report error</a></div>
        </div>
        <div class="link-list">
          <div class="header js-translateable" data-translateable="New Libris and XL">New Libris and XL</div>
          <div class="item"><a href="https://www.youtube.com/watch?v=p2vcgoTfNpw&list=PLZVkEICvA5-GRT2oJQmLgq_2Pksx6zYPy" class="js-translateable" data-translateable="Instruction videos">Instruction videos</a></div>
          <div class="item"><a href="http://librisbloggen.kb.se/" class="js-translateable" data-translateable="Librisbloggen">Librisbloggen</a></div>
          <div class="item"><a href="http://www.kb.se/libris/Om-LIBRIS/Introduktion-till-nya-Libris-och-XL2/" class="js-translateable" data-translateable="Introduction material">Introduktionsmaterial</a></div>
          <div class="item"><a href="http://www.kb.se/libris/" class="js-translateable">kb.se/libris</a></div>
          <div class="item"><a href="https://libris.kb.se/" class="js-translateable">libris.kb.se</a></div>
        </div>
        <div class="link-list">
          <div class="header" data-translateable="Support">Support</div>
          <div class="item"><a class="js-translateable" href="https://kundo.se/org/librisxl/" data-translateable="Forum of support for new Libris">Forum of support for new Libris</a></div>
          <div class="item"><a class="js-translateable" href="http://www.kb.se/libris/kontakta/" data-translateable="Libris customer service">Libris customer service</a></div>
        </div>
        <div class="social-media">
          <div class="header js-translateable" data-translateable="Social media">Social media</div>
          <div>
            <a href="https://www.youtube.com/user/KunglBiblioteket/"><i class="fa fa-2x fa-youtube-play" aria-hidden="true"></i></a>
            <a href="https://twitter.com/librisnytt/"><i class="fa fa-2x fa-twitter-square" aria-hidden="true"></i></a>
            <a href="https://www.facebook.com/LibrisNytt/"><i class="fa fa-2x fa-facebook-square" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">


.footer-container {
  background-color: @bg-footer;
  border: 0px solid @border-footer;
  color: @text-footer;
  box-shadow: @shadow-footer;
  // text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.2);

  .content-container {
    display: flex;
    justify-content: center;
    .header {
      font-weight: bold;
    }
    .item {
      font-size: 14px;
    }
    > div {
      display: flex;
      padding: 0 1em;
    }
    .service-name {
      flex: 20% 1 1;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      font-weight: bold;
      > a {
        text-align: center;
      }
    }
    .link-list {
      flex: 25% 2 2;
      flex-direction: column;
    }
    .social-media {
      flex: 20% 1 1;
      flex-direction: column;
      align-items: center;
      a {
        margin: 0 5px;
      }
    }
  }
  a {
    color: @text-footer;
    text-transform:none;
    &:hover {
      color: @text-footer;
    }
  }
  i {
    color: @text-alt-footer;
  }
}

</style>
