"use client";

import { useState } from "react";
import { BusinessMapData, CellData } from "@/types";
import CellModal from "./CellModal";

interface SelectedCell {
  rowId: string;
  colId: string;
  rowLabel: string;
  colLabel: string;
  cellId: string;
  cellData: CellData;
}

const EMPTY_CELL: CellData = {
  tasks: [],
  comments: [],
  attachments: [],
  reactions: { idea: 0, good: 0, want: 0 },
};

function cellId(rowId: string, colId: string) {
  return `${rowId}__${colId}`;
}

export default function BusinessMap({ data }: { data: BusinessMapData }) {
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  const handleClick = (
    rowId: string,
    colId: string,
    rowLabel: string,
    colLabel: string
  ) => {
    const id = cellId(rowId, colId);
    setSelected({
      rowId,
      colId,
      rowLabel,
      colLabel,
      cellId: id,
      cellData: data.cells[id] ?? EMPTY_CELL,
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr>
              <th className="border-b border-r border-gray-200 bg-gray-50 w-28 min-w-[7rem]" />
              {data.columns.map((col) => (
                <th
                  key={col.id}
                  className="border-b border-r border-gray-200 bg-gray-50 px-3 py-3 text-xs font-semibold text-gray-600 text-center last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr
                key={row.id}
                className={rowIdx < data.rows.length - 1 ? "border-b border-gray-200" : ""}
              >
                {/* Row header */}
                <td
                  className={`border-r border-gray-200 px-3 py-3 text-center text-sm font-bold ${row.headerBg} text-white`}
                >
                  {row.label}
                </td>

                {/* Cells */}
                {data.columns.map((col, colIdx) => {
                  const id = cellId(row.id, col.id);
                  const cell = data.cells[id];
                  const commentCount = cell?.comments.length ?? 0;
                  const attachCount = cell?.attachments.length ?? 0;
                  const taskCount = cell?.tasks.length ?? 0;
                  const totalReactions = cell
                    ? cell.reactions.idea + cell.reactions.good + cell.reactions.want
                    : 0;
                  const hasContent = taskCount > 0 || commentCount > 0 || attachCount > 0;

                  return (
                    <td
                      key={col.id}
                      onClick={() => handleClick(row.id, col.id, row.label, col.label)}
                      className={[
                        "border-r border-gray-100 last:border-r-0 align-top p-2 cursor-pointer transition-colors",
                        "hover:brightness-95",
                        hasContent ? row.bgColor : "bg-white hover:bg-gray-50",
                      ].join(" ")}
                      style={{ minWidth: "120px", minHeight: "72px" }}
                    >
                      {/* Task list */}
                      {cell?.tasks.map((task) => (
                        <p
                          key={task.id}
                          className={`text-xs leading-snug mb-1 ${row.color} font-medium`}
                        >
                          · {task.label}
                        </p>
                      ))}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {commentCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">
                            💬 {commentCount}
                          </span>
                        )}
                        {attachCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5">
                            📎 {attachCount}
                          </span>
                        )}
                        {totalReactions > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-yellow-100 text-yellow-700 rounded px-1.5 py-0.5">
                            ✨ {totalReactions}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <CellModal
          rowLabel={selected.rowLabel}
          colLabel={selected.colLabel}
          cellData={selected.cellData}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
