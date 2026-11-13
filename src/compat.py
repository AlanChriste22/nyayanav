"""Compatibility shims for headless CLI execution when optional plotting/dataframe libraries are absent."""

from __future__ import annotations

import math
import sys
from types import ModuleType
from typing import Any, Iterable


class _SeriesShim:
    def __init__(self, values: list[Any], name: str = ""):
        self._values = list(values)
        self.name = name

    def max(self) -> Any:
        return max(self._values) if self._values else 0

    def min(self) -> Any:
        return min(self._values) if self._values else 0

    def __iter__(self):
        return iter(self._values)

    def __len__(self) -> int:
        return len(self._values)


class _DataFrameShim:
    def __init__(self, rows: list[dict[str, Any]]):
        self._rows = list(rows)
        self.columns = list(rows[0].keys()) if rows else []

    def __getitem__(self, col: str) -> _SeriesShim:
        return _SeriesShim([r.get(col) for r in self._rows], name=col)

    def describe(self) -> str:
        if not self._rows:
            return "Empty DataFrame"
        numeric_cols = [
            c
            for c in self.columns
            if self._rows and isinstance(self._rows[0].get(c), (int, float))
        ]
        lines = [
            "Stat      " + "  ".join(f"{c:>14s}" for c in numeric_cols),
            "-" * (10 + 16 * len(numeric_cols)),
        ]
        stats: dict[str, dict[str, float]] = {}
        for c in numeric_cols:
            vals = sorted(float(r[c]) for r in self._rows)
            n = len(vals)
            mean = sum(vals) / n
            variance = sum((v - mean) ** 2 for v in vals) / max(n - 1, 1)
            std = math.sqrt(variance)
            stats[c] = {
                "count": float(n),
                "mean": mean,
                "std": std,
                "min": vals[0],
                "25%": vals[int(0.25 * (n - 1))],
                "50%": vals[int(0.50 * (n - 1))],
                "75%": vals[int(0.75 * (n - 1))],
                "max": vals[-1],
            }
        for stat_name in ["count", "mean", "std", "min", "25%", "50%", "75%", "max"]:
            row_str = f"{stat_name:8s}  " + "  ".join(
                f"{stats[c][stat_name]:14.2f}" for c in numeric_cols
            )
            lines.append(row_str)
        summary = "\n".join(lines)
        print(summary)
        return summary

    def __repr__(self) -> str:
        return f"DataFrame(rows={len(self._rows)}, columns={self.columns})"


class _AxisShim:
    def __init__(self, index: int = 0):
        self.index = index
        self.title = ""

    def hist(self, data: Iterable[Any], bins: Any = 10, **kwargs: Any) -> None:
        pass

    def bar(self, x: Any, height: Any, width: float = 0.8, **kwargs: Any) -> None:
        pass

    def barh(self, y: Any, width: Any, **kwargs: Any) -> None:
        pass

    def set_title(self, title: str) -> None:
        self.title = title

    def set_xlabel(self, label: str) -> None:
        pass

    def set_ylabel(self, label: str) -> None:
        pass

    def set_xticks(self, ticks: Any) -> None:
        pass

    def set_xticklabels(self, labels: Any) -> None:
        pass

    def set_ylim(self, bottom: float, top: float) -> None:
        pass

    def legend(self, *args: Any, **kwargs: Any) -> None:
        pass


class _FigureShim:
    pass


def _subplots(nrows: int = 1, ncols: int = 1, figsize: tuple[int, int] = (8, 4)):
    fig = _FigureShim()
    total = nrows * ncols
    if total == 1:
        return fig, _AxisShim(0)
    return fig, [_AxisShim(i) for i in range(total)]


def install_shims_if_needed() -> None:
    try:
        import pandas  # noqa: F401
    except ImportError:
        pd_mod = ModuleType("pandas")
        pd_mod.DataFrame = _DataFrameShim  # type: ignore[attr-defined]
        sys.modules["pandas"] = pd_mod

    try:
        import matplotlib
        import matplotlib.pyplot  # noqa: F401

        matplotlib.use("Agg")
    except ImportError:
        mpl_mod = ModuleType("matplotlib")
        plt_mod = ModuleType("matplotlib.pyplot")
        plt_mod.subplots = _subplots  # type: ignore[attr-defined]
        plt_mod.tight_layout = lambda *a, **kw: None  # type: ignore[attr-defined]
        plt_mod.show = lambda *a, **kw: None  # type: ignore[attr-defined]
        mpl_mod.pyplot = plt_mod  # type: ignore[attr-defined]
        sys.modules["matplotlib"] = mpl_mod
        sys.modules["matplotlib.pyplot"] = plt_mod

    # Ensure IPython.display prints actual Markdown text when run in standard CLI terminals
    import __main__

    if not hasattr(__main__, "__IPYTHON__"):
        class _MarkdownShim:
            def __init__(self, data: str = ""):
                self.data = data

            def __str__(self) -> str:
                return str(self.data)

        def _display_shim(*objs: Any) -> None:
            for obj in objs:
                print(getattr(obj, "data", obj))

        ipy_mod = sys.modules.get("IPython") or ModuleType("IPython")
        disp_mod = ModuleType("IPython.display")
        disp_mod.Markdown = _MarkdownShim  # type: ignore[attr-defined]
        disp_mod.display = _display_shim  # type: ignore[attr-defined]
        ipy_mod.display = disp_mod  # type: ignore[attr-defined]
        sys.modules["IPython"] = ipy_mod
        sys.modules["IPython.display"] = disp_mod


install_shims_if_needed()
