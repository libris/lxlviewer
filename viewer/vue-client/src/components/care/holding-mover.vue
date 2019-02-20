<script>
import { mapGetters } from 'vuex';
import PostPicker from '@/components/care/post-picker';

export default {
  name: 'holding-mover',
  components: {
    'post-picker': PostPicker,
  },
  props: {
  },
  methods: {
  },
  computed: {
    ...mapGetters([
      'userCare',
    ]),
  },
};
</script>

<template>
  <div class="HoldingMover">
    <div class="HoldingMover-wrapper">
      <div class="HoldingMover-label uppercaseHeading">{{ 'Sender' | translatePhrase }}</div>
      <post-picker 
        name="sender"
        :items="userCare" 
        info="Från den avsändande posten flyttar du bestånd eller annan information till den mottagande parten"/>
    </div>
    <div class="HoldingMover-wrapper">
      <div class="HoldingMover-label uppercaseHeading">{{ 'Reciever' | translatePhrase }}</div>
      <post-picker 
        name="reciever"
        :items="userCare"/>
    </div>
  </div>
</template>

<style lang="less">

.HoldingMover  {
  width: 100%;
  display: flex;

  &-wrapper {
    max-width: 50%;
    flex: 1;
  }

  &-label {
    padding: 5px 10px;
    background-color: @gray-lighter;
    display: inline-block;
  }
}

</style>
