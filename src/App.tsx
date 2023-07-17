import { useEffect, useReducer, useRef, useState } from "react";
import { isConsonant, isVowel } from "./utils/wordCheck";
import { searchReducer } from "./reducers/searchReducer";
import { CacheApiServer } from "./utils/cacheStorage";
import SearchItem from "./components/searchItem";

function App() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [state, dispatch] = useReducer(searchReducer, {
    loading: false,
    data: null,
    error: null,
  });

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLInputElement | null>(null);
  const debounceTimeoutRef = useRef<any | null>(null);

  const onChangehandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchInput(search);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (
        isConsonant(searchInput[searchInput.length - 1]) ||
        isVowel(searchInput[searchInput.length - 1])
      ) {
        return;
      }
      if (searchInput.length < 1) {
        return;
      }
      fetchGetSearch(searchInput);
    }, 300);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = debounceTimer;

    return () => {
      clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchInput]);

  const fetchGetSearch = async (searchInput: string) => {
    try {
      dispatch({ type: "LOADING" });
      const response = await CacheApiServer.getSearchByQuery(searchInput);
      dispatch({ type: "SUCCESS", data: response.data });
    } catch (error) {
      dispatch({ type: "ERROR", error });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.MouseEvent) => {
    const clickedElement = e.target as HTMLElement;
    if (
      searchInputRef.current &&
      !searchInputRef.current.contains(clickedElement) &&
      !containerRef.current?.contains(clickedElement)
    ) {
      setIsFocused(false);
    }
  };

  if (state.error) return <>문제가 발생하였습니다.</>;
  const lastArr = state.data?.slice(0, 7);
  return (
    <main onClick={handleBlur}>
      <section className="flex flex-col items-center pt-[200px] w-full h-[100vh] p-10 bg-[#CAE9FF]">
        <h3 className="text-4xl font-bold text-black">
          국내 모든 임상시험 검색하고 온라인으로 참여하기
        </h3>
        <div className="relative mt-8 " ref={containerRef}>
          <input
            type="text"
            placeholder="질환명을 입력해 주세요"
            onChange={onChangehandler}
            onFocus={handleFocus}
            ref={searchInputRef}
            className={` ${
              isFocused ? " border-blue-600" : "border-white"
            } focus:outline-none border-4 py-4 pl-8 rounded-full items-center w-[500px] h-[70px] bg-white`}
          />
          <svg
            className="absolute top-6 right-8"
            viewBox="0 0 16 16"
            fill="currentColor"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            width={20}
          >
            <path d="M6.56 0a6.56 6.56 0 015.255 10.49L16 14.674 14.675 16l-4.186-4.184A6.56 6.56 0 116.561 0zm0 1.875a4.686 4.686 0 100 9.372 4.686 4.686 0 000-9.372z"></path>
          </svg>
          {isFocused && (
            <div className="absolute w-[500px] shadow-lg  py-8 rounded-3xl mt-6 h-[500px] bg-white left-1/2 transform -translate-x-1/2">
              <p className="px-8 text-gray-500">
                {state.loading ? "검색중..." : "최근 검색어"}{" "}
              </p>
              <ul>
                {lastArr?.length !== 0 ? (
                  lastArr?.map((item) => (
                    <SearchItem
                      key={item.sickCd}
                      handleBlur={handleBlur}
                      item={item}
                    />
                  ))
                ) : (
                  <div className="px-8">
                    <p>검색어가 없습니다.</p>
                    <p>질환명을 검색해주세요.</p>
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
