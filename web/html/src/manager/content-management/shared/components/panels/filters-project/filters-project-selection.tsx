import * as React from "react";
import { useEffect, useState } from "react";
import { LinkButton } from "components/buttons";
import useLifecycleActionsApi from "../../../api/use-lifecycle-actions-api";
import { ProjectFilterServerType } from "../../../type";
import { Loading } from "components/utils/Loading";
import _xor from "lodash/xor";
import { getClmFilterDescription } from "../../../business/filters.enum";
import { Utils } from "utils";

type FiltersProps = {
  projectId: string;
  initialSelectedFiltersIds: Array<number>;
  onChange: Function;
  isUpdatingFilter: boolean;
};

type Filter = ProjectFilterServerType & { description: string };

const FiltersProjectSelection = (props: FiltersProps) => {
  const { onAction: onActionAllFilters, isLoading: isLoadingAllFilters } = useLifecycleActionsApi({
    resource: "filters",
  });
  const [filterText, setFilterText] = useState("");
  const [allFilters, setAllFilters]: [Array<Filter>, Function] = useState([]);
  const [onGoingSelectedFilters, setOnGoingSelectedFilters] = useState(props.initialSelectedFiltersIds);

  useEffect(() => {
    onActionAllFilters({}, "get").then((apiAllFilters: ProjectFilterServerType[]) => {
      const sorted = apiAllFilters
        .map((item) =>
          Object.assign(item, {
            description: getClmFilterDescription(item),
          })
        )
        .sort((a, b) => Utils.localeCompare(a.description, b.description));
      setAllFilters(sorted);
    });
  }, []);

  useEffect(() => {
    props.onChange(onGoingSelectedFilters);
  }, [onGoingSelectedFilters]);

  if (isLoadingAllFilters) {
    return <Loading text={t("Loading global filters...")} />;
  }

  if (props.isUpdatingFilter) {
    return <Loading text={t("Updating project filters...")} />;
  }

  const filters = filterText ? allFilters.filter((item) => item.description.includes(filterText)) : allFilters;

  return (
    <React.Fragment>
      <input
        type="text"
        placeholder={t("Search")}
        autoFocus
        className="form-control"
        onChange={(event) => setFilterText(event.target.value)}
      />
      <div className="spacewalk-list">
        {filters.map((filter) => (
          <div key={filter.id} className="checkbox">
            <input
              type="checkbox"
              value={filter.id}
              id={"child_" + filter.id}
              name="filterSelection"
              checked={onGoingSelectedFilters.includes(filter.id)}
              onChange={(event) =>
                setOnGoingSelectedFilters(_xor(onGoingSelectedFilters, [parseInt(event.target.value, 10)]))
              }
            />
            <label htmlFor={"child_" + filter.id}>{filter.description}</label>
          </div>
        ))}
      </div>
      <LinkButton
        icon="fa-plus"
        className="btn-link js-spa"
        text={t("Create New Filter")}
        href={`/rhn/manager/contentmanagement/filters?openFilterId=-1&projectLabel=${props.projectId}`}
      />
    </React.Fragment>
  );
};

export default FiltersProjectSelection;
