import { getSearchData } from "../apis/axios";

const BASE_URL = "http://localhost:4000/";
const HEADER_FETCH_DATE = "fetch-date";
const ONE_DAY_MILISECOND = 60 * 60 * 1000;

export class CacheApiServer {
  private static searchCacheStorage = "SEARCH_CACHE_STORAGE";

  static async getSearchByQuery(query: string) {
    const url = `${BASE_URL}sick?q=${query}`;
    const cache = await caches.open(this.searchCacheStorage);

    return await this.getValidResponse(cache, url, query);
  }

  private static async getValidResponse(
    cache: Cache,
    url: string,
    query: string
  ) {
    const cacheResponse = await caches.match(url);
    return cacheResponse && !this.isCacheExpired(cacheResponse)
      ? await cacheResponse.json()
      : await this.getFetchResponse(cache, url, query);
  }

  private static async getFetchResponse(
    cache: Cache,
    url: string,
    query: string
  ) {
    const fetchResponse = await getSearchData(query);
    if (fetchResponse.data.length !== 0) {
      this.setCacheResponse(cache, url, fetchResponse);
    }

    return fetchResponse;
  }

  static async setCacheResponse(cache: Cache, url: string, data: any) {
    const cacheResponse = new Response(JSON.stringify(data));
    const newResponse = await this.getResponseWithFetchDate(cacheResponse);
    cache.put(url, newResponse);
  }

  private static async getResponseWithFetchDate(fetchResponse: Response) {
    const cloneResponse = fetchResponse.clone();
    const newBody = await cloneResponse.blob();
    const newHeaders = new Headers(cloneResponse.headers);
    newHeaders.append(HEADER_FETCH_DATE, new Date().toISOString());

    return new Response(newBody, {
      status: cloneResponse.status,
      statusText: cloneResponse.statusText,
      headers: newHeaders,
    });
  }

  private static isCacheExpired(cacheResponse: Response) {
    const fetchDate = new Date(
      cacheResponse.headers.get(HEADER_FETCH_DATE)!
    ).getTime();
    const today = new Date().getTime();
    return today - fetchDate > ONE_DAY_MILISECOND;
  }
}
