## ⚙️ 실행 방법
```
$ git clone https://github.com/kjungit/pre-onboarding-11th-searchBar.git
$ yarn install
$ yarn start
```

## 🔥 과제 목표
- 검색창 구현 + 검색어 추천 기능 구현 + 캐싱 기능 구현
- https://clinicaltrialskorea.com/ 검색 영역 클론
- [x] 질환명 검색시 API 호출 후 검색어 추천 기능 구현
   - [x] 검색어가 없을 시 "검색어 없음" 표출
- [x] API 호출별로 로컬 캐싱 구현
   - [x] 캐싱 기능을 제공하는 라이브러리 사용 금지(React-Query 등)
   - [x] expire time을 구현할 경우 가산점
- [x] 입력마다 API 호출하지 않도록 API 호출 횟수를 줄이는 전략 수립 및 실행
- [x] API를 호출할 때 마다 `console.info("calling api")` 출력을 통해 콘솔창에서 API 호출 횟수 확인이 가능하도록 설정
- [x] 키보드만으로 추천 검색어들로 이동 가능하도록 구현

</br>

## 🙆🏻 과제 구현 기능 설명
### 📌 API호출별 로컬 캐싱 (cacheStorage)
- 네트워크 요청에 따라 리소스를 캐싱하기 때문에 CacheStroge API를 사용하는 것이 적합하다고 판단
- 로직을 구현하기전 프로세스 정리
    - 캐시 저장소 열기
    - 저장한 캐시에서 일치하는 캐시 응답 확인 + 만료기간확인 (여기서 없으면 서버에 요청)  
    - 만약 요청한 결과중 데이터가 없으면 retrun
    - 캐시에 일치하는게 없으면 캐시 저장
    - 만료기간을 설정하여 일정 기간 동안 사용하도록 설정

#### - 캐시된 응답 확인 
```ts
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
```
- 현재 요청한 url과 일치하는 캐시가 있는지 확인 및 만료기간 확인
- 조건에 따라 캐시된 데이터를 사용하거나 네트워크 요청을 새로 보내도록 구현


---


#### - 네트워크 요청
```ts
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
```
- 네트워크 요청후 바로 캐시에 저장하는게 아닌 데이터 값 확인
- 데이터가 비어있으면 CacheStroge에 저장하지 않도록 구현


---


#### - CacheStroge 저장
```ts
  static async setCacheResponse(cache: Cache, url: string, data: any) {
    const cacheResponse = new Response(JSON.stringify(data));
    const newResponse = await this.getResponseWithFetchDate(cacheResponse);
    cache.put(url, newResponse);
  }
```
- 캐시 응답을 생성하여 캐시에 저장


---


#### - 만료기간 지정 및 만료여부 로직
```ts
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

  private static isCacheExpired(cacheResponse: Response) {
    const fetchDate = new Date(
      cacheResponse.headers.get(HEADER_FETCH_DATE)!
    ).getTime();
    const today = new Date().getTime();
    return today - fetchDate > ONE_DAY_MILISECOND;
  }
```
- blob메소드를 사용하여 헤더에 현재시간을 같이 등록
- 만료 기간을 지정할때 등록한 시간과 현재 시간을 비교
- 설정한 시간을 변수에 담아 시간을 비교하여 만료되었으면 새로 요청

---
</br>

### 📌 API호출 줄이기 debouncing + params 유효성 검사
#### debouncing
- setTimeout, clearTimeout을 사용하여 0.3s마다 API요청 구현
#### params 유효성 검사
```ts
export function isConsonant(character: string) {
  return /[ㄱ-ㅎ]/.test(character);
}

export function isVowel(character: string) {
  return /[ㅏ-ㅣ]/.test(character);
}

```
- API에 전달하는 params를 분석하니 단어에 맞게 응답값이 오는걸 확인
- 보내는 params의 마지막 문자를 자음 또는 모음인지 검사 후 요청 되도록 구현
---

</br>

### 📌 키보드로 검색어 이동
- tabIndex를 사용하여 input창 다음으로 추천검색어에 순서대로 지정되도록 구현
