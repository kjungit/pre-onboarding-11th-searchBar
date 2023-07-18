import { ISearchData } from "../reducers/searchReducer";

interface ISearchItemProps {
  item: ISearchData;
  i: number;
}

function SearchItem({ item, i }: ISearchItemProps) {
  return (
    <li
      tabIndex={i}
      className={`h-[40px] flex items-center hover:bg-gray-100 px-8 mb-1`}
    >
      <img
        src="/searchIcon.svg"
        alt="Search Icon"
        className="w-[20px] h-[20px]"
      />
      <span className="ml-2 text-xl">{item.sickNm}</span>
    </li>
  );
}

export default SearchItem;
