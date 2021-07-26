import { NewsFeed, NewsDetail } from '../types';
import { NEWS_URL, CONTENT_URL } from '../config';

export class Api {
	getRequest<AjaxResponse>(url: string, cb: (data: AjaxResponse) => void): void {
    const ajax = new XMLHttpRequest();
		ajax.open('GET', url);
		ajax.addEventListener('load', () => {
			cb(JSON.parse(ajax.response));
		});

		ajax.send();
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
	getData(cb: (data: NewsFeed[]) => void): void {
		return this.getRequest<NewsFeed[]>(NEWS_URL, cb);
	}
}

export class NewsDetailApi {
	getData(id: string, cb: (data: NewsDetail) => void): void {
		return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id',id), cb)
	}
}

export interface NewsFeedApi extends Api {}
export interface NewsDetailApi extends Api {}

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);