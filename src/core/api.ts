import { NewsFeed, NewsDetail } from '../types';
import { NEWS_URL, CONTENT_URL } from '../config';

export class Api {
	async request<AjaxResponse>(url: string): Promise<AjaxResponse> {
		const response = await fetch(url);
		return await response.json();
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
	async getData(): Promise<NewsFeed[]> {
		return this.request<NewsFeed[]>(NEWS_URL);
	}
}

export class NewsDetailApi {
	async getData(id: string): Promise<NewsDetail> {
		return this.request<NewsDetail>(CONTENT_URL.replace('@id', id));
	}
}

export interface NewsFeedApi extends Api {}
export interface NewsDetailApi extends Api {}

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);