<template>
  <h1>{{ msg }}</h1>
  <ul>
    <li>{{ items[0] }}</li>
    <li>{{ items[1] }}</li>
    <li>{{ items[2] }}</li>
    <li>{{ items[3] }}</li>
    <li>{{ items[4] }}</li>
  </ul>
</template>
<script>
export default {
  data() { return { msg: 'Hello, GetSampleData.com!', items: ["Item 0", "Item 1", "Item 2", "Item 3", "Item 4"] } }
}
</script>
