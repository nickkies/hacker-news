const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json';
const store = {
	currentPage: 1,
};

function getData(url) {
	ajax.open('GET', url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

function newsFeed() {
	const newsFeed = getData(NEWS_URL);
	const newsList = [];
	let template = `
		<div class="container mx-auto p-4">
			<h1>Hacker News</h1>
			<ul>
				{{__news_feed__}}
			</ul>
			<div>
				<a href="#/page/{{__prev_page__}}">이전 페이지</a>
				<a href="#/page/{{__next_page__}}">다음 페이지</a>
			</div>
		</div>
	`;

	for ( let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++ ) {
		const news = newsFeed[i];

		newsList.push(`
	    <li>
	      <a href="#/show/${news.id}">
					${news.title}(${news.comments_count})
				</a>
	    </li>
	  `);
	}

	const cp = store.currentPage,
		tp = Math.ceil(newsFeed.length/10);

	template = template.replace('{{__news_feed__}}', newsList.join(''));
	template = template.replace('{{__prev_page__}}', cp > 1 ? cp - 1 : 1);
	template = template.replace('{{__next_page__}}', cp < tp ? cp + 1 : tp);

	container.innerHTML = template;

}

function newsDetail() {
	const id = location.hash.substr(7);
	const newsContent = getData(CONTENT_URL.replace('@id', id));

	container.innerHTML = `
    <h1>${newsContent.title}</h1>
    <div>
        <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
  `;
}

function router() {
	const routePath = location.hash;

	if ( routePath === '' ) {
		newsFeed();
	} else if ( routePath.indexOf('#/page/') >= 0 ) {
		store.currentPage = Number(routePath.substr(7));
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener('hashchange', router);

router();