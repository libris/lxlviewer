<script>
import { uniq, sortBy } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import ItemVocab from '@/components/inspector/item-vocab';

export default {
  name: 'item-type',
  extends: ItemVocab,
  props: {
  },
  data() {
    return {
    };
  },
  computed: {
    range() {
      const docType = VocabUtil.getRecordType(this.entityType, this.resources.vocab, this.resources.context);
      return [docType].concat(VocabUtil.getSubClasses(docType, this.resources.vocabClasses, this.resources.context));
    },
  },
  methods: {
    getPossibleValues() {
      let values = uniq(this.range);
      return sortBy(values, value => StringUtil.getLabelByLang(
        value, 
        this.settings.language, 
        this.resources.vocab, 
        this.resources.context,
      ));
    },
  },
  components: {
  },
};
</script>