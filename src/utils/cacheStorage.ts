import { getSearchData } from "../apis/axios";

const BASE_URL = "http://localhost:4000/";
const HEADER_FETCH_DATE = "fetch-date";
const ONE_DAY_MILISECOND = 60 * 60 * 24 * 1000;

export class CacheApiServer {
  private static searchCacheStorage = "SEARCH_CACHE_STORAGE";

  static async getSearchByQuery(query: string) {
    const url = `${BASE_URL}sick?q=${query}`; // 쿼리 url 생성
    const cache = await caches.open(this.searchCacheStorage); // 캐시 저장소 열기

    return await this.getValidResponse(cache, url, query);
  }

  private static async getValidResponse(
    cache: Cache,
    url: string,
    query: string
  ) {
    const cacheResponse = await caches.match(url); // 요청 쿼리와 일치하는 캐시 응답 가져오기
    return cacheResponse && !this.isCacheExpired(cacheResponse)
      ? await cacheResponse.json() // 응답이 존재하면 반환
      : await this.getFetchResponse(cache, url, query); // 존재하지 않으면 서버에 요청
  }

  private static async getFetchResponse(
    cache: Cache,
    url: string,
    query: string
  ) {
    const fetchResponse = await getSearchData(query);
    // 없는 데이터는 저장하지 않도록
    if (fetchResponse.data.length !== 0) {
      this.setCacheResponse(cache, url, fetchResponse);
    }

    return fetchResponse;
  }

  static async setCacheResponse(cache: Cache, url: string, data: any) {
    const cacheResponse = new Response(JSON.stringify(data));
    const newResponse = await this.getResponseWithFetchDate(cacheResponse);
    cache.put(url, newResponse); // 캐시 저장
  }

  // 유효 기간 지정
  private static async getResponseWithFetchDate(fetchResponse: Response) {
    const cloneResponse = fetchResponse.clone();
    const newBody = await cloneResponse.blob();
    let newHeaders = new Headers(cloneResponse.headers);
    newHeaders.append(HEADER_FETCH_DATE, new Date().toISOString());

    return new Response(newBody, {
      status: cloneResponse.status,
      statusText: cloneResponse.statusText,
      headers: newHeaders,
    });
  }

  // 만료 여부
  private static isCacheExpired(cacheResponse: Response) {
    const fetchDate = new Date(
      cacheResponse.headers.get(HEADER_FETCH_DATE)!
    ).getTime();
    const today = new Date().getTime();
    return today - fetchDate > ONE_DAY_MILISECOND;
  }
}
