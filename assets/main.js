Vue.config.devtools = true;

// Store
const store = new Vuex.Store({
    state: {
        event: false,
        arrLang:['it','gb','es','fr','de'],
        title:null
    },

    mutations: {
        toggleEvent (state,id) {
            if (id === 'toggle') {
                state.event = !state.event;
            }else {
                state.event = false;
            }

        },
        changeLang(state,lang) {
            state.lang = lang;
            state.arrLang.splice(state.arrLang.indexOf(lang),1);
            state.arrLang.unshift(lang);
        }
    }
})

// Input search movie
Vue.component("search-movie", {
    methods: {
        searchValue(){
            this.$store.state.title;
            this.$emit("submit-title", this.$el.value);
        }
    },

    computed:{
        translate(){
            let textTrans;
            switch (this.$store.state.arrLang[0]) {
                case 'it':
                    textTrans ='Cerca...';
                    break;
                case 'gb':
                    textTrans ='Search...';
                    break;
                case 'de':
                    textTrans ='Suchen...';
                    break;
                case 'fr':
                    textTrans ='Rechercher...';
                    break;
                case 'es':
                    textTrans ='Buscar...';
                    break;
                default:
                    textTrans ='Titolo...';
            }
            return textTrans;
        }
    },

    template: `
    <input type="text"
        class="from-control"
        id="newTitle"
        :placeholder="translate"
        @keyup="searchValue"
        @keyup.enter="searchValue"
        >
    `
})


// single-lang
Vue.component("single-lang", {
    props: {
        lang: {
            type: String,
            required: true
        },
    },

    methods: {
        changeLang(lang){
            this.$store.commit('changeLang',lang)
            app.updateMovie();
        },
    },

    template: `
        <div @click="changeLang(lang)">
            <img
                style="width: 100%;"
                :src="'https://www.countryflags.io/' + lang +
                '/flat/64.png'"
                :id= "lang">
        </div>
    `
})


// lang-selct super(single-lang)
Vue.component("lang-selct", {
    props: {
        langs: {
            type: Array,
            required: true
        },
    },

    methods: {
        toggleEvent() {
            this.$store.commit('toggleEvent','toggle')
        }
    },

    template: `
    <div id="langSelct" class="position-relative">

        <div @click.stop="toggleEvent">
            <img
                :src="'https://www.countryflags.io/' + langs[0] +
                '/flat/64.png'"
                style="width: 100%;">
        </div>

        <div v-show="this.$store.state.event" id="cont-OthLang"
        class="animate__animated animate__flipInY animate__faster">

            <single-lang
                v-for="(lang,index) in langs"
                v-show="lang != langs[0]"
                :lang ="lang"
                :key= "index">
            </single-lang>

        </div>
    </div>
    `
})


// single movie
Vue.component("single-movie", {

    props: {
        movie: {
            type: Object,
            required: true,
        },
    },

    methods: {
        checkIso(iso){
            let pathIso;
            if (iso === 'en') {
                pathIso  = 'https://www.countryflags.io/' + 'gb' +
                '/flat/64.png';
            }else
                pathIso  = 'https://www.countryflags.io/' + iso + '/flat/64.png';

            return pathIso;
        },

        flegError: function(e){
            console.log(e);
        },

        checkName(movie){
            let isDifferent;
            if ("title" in movie && movie.title.toLowerCase() != movie.original_title.toLowerCase()){
                isDifferent = true;
            }else if("name" in movie && movie.name.toLowerCase() != movie.original_name.toLowerCase()){
                isDifferent = true;
            }else {
                isDifferent = false;
            }
            return isDifferent;
        },
        calcVote(vote){

            let newVote5 = Math.ceil(vote / 2);
            let starsFull = `<i class="fas fa-star"></i>`;
            let starsEmpty = `<i class="far fa-star"></i>`;
            let res = "Voto : ";

            for (var i = 0; i < 5; i++) {
                if (i < newVote5) {
                    res = res + starsFull;
                }else {
                    res = res + starsEmpty;
                }
            }
            return res;
        },
    },

    template: `
    <div class="myCard">

        <img v-if="movie.poster_path" class="card-poster" :src="'https://image.tmdb.org/t/p/w780/' + movie.poster_path">
        <img v-else class="card-poster" src="assets\\img\\image-unavailable.jpg">

        <!-- <button type="button">
            <i class="fa fa-play-circle fa-3x"></i>
        </button> -->

        <div class="myCard-body">
            <h4 class="myCard-title">
            <strong>{{ movie.title || movie.name }}</strong> </h4>

            <p v-if="checkName(movie)" class="myCard-original_title"><strong>Titolo originale :</strong>
            {{ movie.original_title || movie.original_name}} </p>

            <div class="myCard-lang"><strong>Lingua :</strong>
                <img
                    :src="checkIso(movie.original_language)" style="width: 20px;">
            </div>

            <div v-html="calcVote(movie.vote_average)" class="myCard-vote"></div>
        </div>
    </div>
    `
})


// Movie-list super(single-movie)
Vue.component("movie-list", {
    props: {
        movies: {
            type: Array,
            required: true,
            // aggiungere default con lista film iniziale
        },
    },

    template: `
    <div id="movieList" class="container-Movie scroll animate__animated animate__fadeIn" v-show="movies.length">

        <single-movie
            v-for="(movie,index) in movies"
            :movie ="movie"
            :key= "index">

        </single-movie>

        <div class="offset-card"></div>
    </div>
    `
})


// ****** ROOT *********
var app = new Vue({

    el: '#root',
    store,
    data: {
        searchName: '',
        arrMovie:[],
        api_key:'d946c02e826363f17a3171b1dd75b7d5',
        uri:'https://api.themoviedb.org/3',
        title: null,
        lang: null,
    },

    mounted:function () {
        this.lang = store.state.arrLang[0];
    },

    methods: {
        updateMovie(){
            this.lang = store.state.arrLang[0];
            this.callMovies(this.title);
        },
        callMovies(title){
            this.title = title;
            this.arrMovie = [];

            if (this.lang === 'gb') {
                this.lang = 'en';
            }

            if (title) {
                let params = {
                    params: {
                        api_key : this.api_key,
                        query: title,
                        language:this.lang
                    }
                }
                // Call Movie
                axios
                .get(`${this.uri}/search/movie`,params)
                .then(response  => {
                    response.data.results.map(movie => {
                        this.arrMovie.push(Object.assign ({}, movie));
                    })
                })
                .catch(error => console.log(error))

                // Call Series
                axios
                .get(`${this.uri}/search/tv`, params)
                .then(response  => {
                    response.data.results.map(movie => {
                        this.arrMovie.push(Object.assign ({}, movie));
                    })
                })
                .catch(error => console.log(error))
            }else {
                this.arrMovie =  [];
            }
        },
        toggleEvent() {
            this.$store.commit('toggleEvent')
        }
    },
})
