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
    <post-picker 
      name="sender"
      :items="userCare" 
      info="Från den avsändande posten flyttar du bestånd eller annan information till den mottagande parten"/>
    <post-picker 
      name="reciever"
      :items="userCare"/>
  </div>
</template>

<style lang="less">

.HoldingMover  {
  width: 100%;
  display: flex;
}

</style>
