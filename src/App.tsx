import { useEffect, useReducer, useRef, useState } from "react";
import { isConsonant, isVowel } from "./utils/wordCheck";
import { searchReducer } from "./reducers/searchReducer";
import { CacheApiServer } from "./utils/cacheStorage";
import SearchItem from "./components/searchItem";
import { BiSearch } from "react-icons/bi";
import { AiFillCloseCircle } from "react-icons/ai";

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

  const deleteInput = () => {
    setSearchInput("");
  };

  const [curLength, setCurLength] = useState<number>(-1);
  const lastArr = searchInput.length === 0 ? [] : state.data?.slice(0, 7);

  const arrLength = lastArr?.length && lastArr.length;
  const changeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (arrLength === undefined || lastArr === undefined) return;
    if ((e.key === "ArrowDown" || e.key === "Tab") && searchInput.length) {
      e.preventDefault();
      console.log();
      arrLength > 0 && arrLength < 7
        ? setCurLength((prev) => (prev + 1) % arrLength)
        : setCurLength((prev) => (prev + 1) % 7);
    }
    if (e.key === "ArrowUp") {
      arrLength > 0 && arrLength < 7
        ? setCurLength((prev) => (prev - 1 + arrLength) % arrLength)
        : setCurLength((prev) => (prev - 1 + 7) % 7);
    }

    if (e.key === "Enter") {
      const selectedItem = lastArr[curLength];
      setSearchInput(selectedItem.sickNm);
    }
  };

  if (state.error) return <>문제가 발생하였습니다.</>;
  return (
    <main onClick={handleBlur}>
      <section className="flex flex-col items-center pt-[200px] w-full h-[100vh] p-10 bg-[#CAE9FF] ">
        <h3 className="text-4xl font-bold text-black">
          국내 모든 임상시험 검색하고 온라인으로 참여하기
        </h3>
        <div
          className={`${
            isFocused && "border-blue-600 border-4"
          } mt-8 border-white border-4 px-4 bg-white justify-between rounded-full relative flex items-center w-[640px] h-[90px]`}
          ref={containerRef}
        >
          <input
            tabIndex={1}
            type="text"
            onChange={onChangehandler}
            onFocus={handleFocus}
            ref={searchInputRef}
            value={searchInput}
            onKeyDown={changeSearch}
            placeholder="질환명을 입력해 주세요."
            className={`rounded-full pl-4 outline-none w-[500px] border-white text-lg`}
          />
          {isFocused && (
            <AiFillCloseCircle
              onClick={deleteInput}
              className="text-3xl text-gray-400 cursor-pointer"
            />
          )}
          <button
            type="button"
            className="rounded-full  ml-4 w-[60px] h-[60px] bg-[#007BE9]  flex items-center justify-center"
          >
            <BiSearch className="w-[30px] h-[30px]  text-white" />
          </button>
          {isFocused && (
            <div className="absolute w-[640px] top-20  shadow-lg  py-8 rounded-3xl mt-6 h-[500px] bg-white left-1/2 transform -translate-x-1/2">
              <div className="flex items-center pl-8 text-xl font-bold">
                <div>
                  <img
                    src="/searchIcon.svg"
                    alt="Search Icon"
                    className="w-[20px] h-[20px]"
                  />
                </div>
                <span className="pl-2">{searchInput}</span>
              </div>
              <p className="px-8 py-4 text-gray-500">
                {state.loading ? "검색중..." : "추천 검색어"}
              </p>
              <ul>
                {lastArr?.length !== 0 ? (
                  lastArr?.map((item, index) => (
                    <SearchItem
                      key={item.sickCd}
                      item={item}
                      searchInput={searchInput}
                      index={index}
                      curLength={curLength}
                    />
                  ))
                ) : (
                  <div className="px-8 text-lg">
                    <p>검색어가 없습니다.</p>
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
