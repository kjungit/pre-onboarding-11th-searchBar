import { ISearchData } from "../reducers/searchReducer";
import { BiSearch } from "react-icons/bi";

interface ISearchItemProps {
  item: ISearchData;
  searchInput: string;
  index: number;
  curLength: number;
}

export function SearchItem({
  item,
  searchInput,
  index,
  curLength,
}: ISearchItemProps) {
  const highlightSearchInput = (text: string, searchInput: string) => {
    const parts = text.split("");
    return parts.map((part, index) => {
      if (searchInput.includes(part)) {
        return (
          <span key={index} className="font-bold">
            {part}
          </span>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };
  const res = highlightSearchInput(item.sickNm, searchInput);
  return (
    <li
      tabIndex={index + 1}
      className={`${
        index === curLength && "bg-gray-100"
      } h-[40px] focus:outline-none focus:bg-gray-100 flex items-center hover:bg-gray-100 px-8 mb-1`}
    >
      <BiSearch className="w-[30px] h-[30px]  text-gray-500" />
      <span className="ml-2 text-xl">{res}</span>
    </li>
  );
}

export default SearchItem;
