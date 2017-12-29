new Vue({
  el: '#giffy',
  data: {
    query: "batman",
    header: {
      first: "Sprint",
      second: "Planning" },
    results: [],
    giffyUrl: "https://media4.giphy.com/media/7p3e2WCM0VEnm/giphy.gif"
    },
  methods: {
      grabGiffy: function(e) {
        var orig = this;
        Vue.http.get("https://api.giphy.com/v1/gifs/search?q="+this.query+"&api_key=dc6zaTOxFJmzC&limit=16&offset=0", function(data){
          orig.results = [];
          for(index in data.data) {
orig.results.push(data.data[index].images.original.url);
          }
      });
    },
    selectGiffy: function(index) {
      this.giffyUrl = this.results[index];
    }
  }

});
