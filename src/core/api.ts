import { NewsFeed, NewsDetail } from '../types';
import { NEWS_URL, CONTENT_URL } from '../config';

export class Api {
	getRequestWithXHR<AjaxResponse>(url: string, cb: (data: AjaxResponse) => void): void {
    const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.addEventListener('load', () => {
			cb(JSON.parse(xhr.response));
		});

		xhr.send();
	}

	getRequest<AjaxResponse>(url: string, cb: (data: AjaxResponse) => void): void {
		fetch(url)
			.then(response => response.json())
			.then(cb)
			.catch(() => {
				console.error('데이터를 불러오지 못했습니다.');
			});
	}
}

// mixin!!!
function applyApiMixins(targetClass: any, baseClasses: any[]): void {
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

      if ( descriptor ) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
}

export class NewsFeedApi {
	getDataWithXHR(cb: (data: NewsFeed[]) => void): void {
		return this.getRequestWithXHR<NewsFeed[]>(NEWS_URL, cb);
	}
	getData(cb: (data: NewsFeed[]) => void): void {
		return this.getRequest<NewsFeed[]>(NEWS_URL, cb);
	}
}

export class NewsDetailApi {
	getDataWithXHR(id: string, cb: (data: NewsDetail) => void): void {
		return this.getRequestWithXHR(CONTENT_URL.replace('@id', id), cb);
	}
	getData(id: string, cb: (data: NewsDetail) => void): void {
		return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id), cb);
	}
}

export interface NewsFeedApi extends Api {}
export interface NewsDetailApi extends Api {}

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);