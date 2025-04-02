<script lang="ts">
	import popover from '$lib/actions/popover';
	import BiHouseHeart from '~icons/bi/house-heart';
</script>

<a
	href="/"
	class="p-2"
	use:popover={{
		title: 'Finns på ditt bibliotek'
	}}
>
	<BiHouseHeart width={20} height={20} />
</a>
