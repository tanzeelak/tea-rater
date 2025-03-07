import React, { useEffect, useState } from "react";
import { getTeas } from "../services/api";

interface Tea {
  id: number;
  tea_name: string;
  provider: string;
}

const TeaList: React.FC = () => {
  const [teaList, setTeaList] = useState<Tea[]>([]);

  useEffect(() => {
    getTeas().then((res) => setTeaList(res.data as Tea[]));
  }, []);
  return (
    <ul>
      {teaList.map((tea) => (
        <li key={tea.id}>
          {tea.tea_name} - {tea.provider}
        </li>
      ))}
    </ul>
  );
};

export default TeaList;
