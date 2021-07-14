interface Store {
	currentPage: number;
	feeds: NewsFeed[];
}

interface News {
	readonly id: number;
	readonly time_ago: string;
	readonly title: string;
	readonly url: string;
	readonly user: string;
	readonly content: string
}

interface NewsFeed  extends News {
	readonly comments_count: number;
	readonly points: number;
	read?: boolean;
}

interface NewsDetail extends News {
	readonly comments: NewsComment[];
}

interface NewsComment extends News {
	readonly comments: NewsComment[];
	readonly level: number;
}

const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'http://api.hnpwa.com/v0/item/@id.json';
const store: Store = {
	currentPage: 1,
	feeds: [],
};

class Api {
	url: string;
	ajax: XMLHttpRequest;

	constructor(url: string) {
		this.url = url;
		this.ajax = new XMLHttpRequest();
	}

	protected getRequest<AjaxResponse>(): AjaxResponse {
		this.ajax.open('GET', this.url, false);
		this.ajax.send();

		return JSON.parse(this.ajax.response);
	}
}

class NewsFeedApi extends Api {
	getData(): NewsFeed[] {
		return this.getRequest<NewsFeed[]>();
	}
}

class NewsDetailApi extends Api {
	getData(): NewsDetail {
		return this.getRequest<NewsDetail>()
	}
}

//function getData(url: string): NewsFeed[] | NewsDetail {
//function getData<T>(url: string): T {
/*function getData<AjaxResponse>(url: string): AjaxResponse {
	ajax.open('GET', url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}*/

function makeFeed(feeds: NewsFeed[]): NewsFeed[] {

	feeds.forEach(feed => {
		feed.read = false;
	});

	return feeds;
}

function updateView(html: string): void {
	if ( container )
		container.innerHTML = html;
	else
		console.log('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
}

function newsFeed(): void {
	const api = new NewsFeedApi(NEWS_URL);
	let newsFeed: NewsFeed[] = store.feeds;
	const newsList = [];
	let template = `
		<div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}        
      </div>
    </div>
	`;

	if ( newsFeed.length === 0 ) {
		newsFeed = store.feeds = makeFeed(api.getData());
	}

	for ( let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++ ) {
		const news = newsFeed[i];

		newsList.push(`
	    <div class="p-6 ${news.read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${news.id}">${news.title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${news.comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${news.user}</div>
            <div><i class="fas fa-heart mr-1"></i>${news.points}</div>
            <div><i class="far fa-clock mr-1"></i>${news.time_ago}</div>
          </div>  
        </div>
      </div> 
	  `);
	}

	const cp = store.currentPage,
		tp = Math.ceil(newsFeed.length/10);

	template = template.replace('{{__news_feed__}}', newsList.join(''));
	template = template.replace('{{__prev_page__}}', String(cp > 1 ? cp - 1 : 1));
	template = template.replace('{{__next_page__}}', String(cp < tp ? cp + 1 : tp));

	updateView(template);
}

function newsDetail(): void {
	const id = location.hash.substr(7);
	const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
	const newsContent = api.getData();
	let template = `
	<div class="bg-gray-600 min-h-screen pb-8">
	  <div class="bg-white text-xl">
		<div class="mx-auto px-4">
		  <div class="flex justify-between items-center py-6">
			<div class="flex justify-start">
			  <h1 class="font-extrabold">Hacker News</h1>
			</div>
			<div class="items-center justify-end">
			  <a href="#/page/${store.currentPage}" class="text-gray-500">
				<i class="fa fa-times"></i>
			  </a>
			</div>
		  </div>
		</div>
	  </div>

	  <div class="h-full border rounded-xl bg-white m-6 p-4 ">
		<h2>${newsContent.title}</h2>
		<div class="text-gray-400 h-20">
		  ${newsContent.content}
		</div>

		{{__comments__}}
	
	  </div>
	</div>
  	`;

	for ( const feed of store.feeds ) {
		if ( feed.id === Number(id) ) {
			feed.read = true;
			break;
		}
	}

	window.scroll(0,0);

	updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

function makeComment(comments: NewsComment[]): string {
	const commentStr = [];

	for ( let i = 0; i < comments.length; i++ ) {
		const comment: NewsComment = comments[i];

		commentStr.push(`
			<div style="padding-left: ${comment.level * 40}px;" class="mt-4">
			  <div class="text-gray-400">
				<i class="fa fa-sort-up mr-2"></i>
				<strong>${comment.user}</strong> ${comment.time_ago}
			  </div>
			  <p class="text-gray-700">${comment.content}</p>
			</div>
		`);

		if ( comment.comments.length > 0 ) {
			commentStr.push(makeComment(comment.comments));
		}
	}

	return commentStr.join('');
}

function router(): void {
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