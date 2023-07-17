import { ISearchData } from "../reducers/searchReducer";

interface ISearchItemProps {
  handleBlur: React.MouseEventHandler<HTMLAnchorElement>;
  item: ISearchData;
}

const LINK_URL = "https://clinicaltrialskorea.com";

function SearchItem({ handleBlur, item }: ISearchItemProps) {
  return (
    <a
      onClick={handleBlur}
      key={item.sickNm}
      target="_blank"
      href={`${LINK_URL}/studies?conditions=${item.sickNm}`}
    >
      <li className={`h-[40px] flex items-center hover:bg-gray-100 px-8`}>
        {item.sickNm}
      </li>
    </a>
  );
}

export default SearchItem;
