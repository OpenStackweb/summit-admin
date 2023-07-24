import React, { useEffect, useState } from "react";
import TreeView, { flattenTree } from "react-accessible-treeview";

const ExpandIndicator = ({ isExpanded }) => {
   return isExpanded ? ' - ' : ' + ';
};

const TemplateSchemaTree = ({ template_schema }) => {
   const [data, setData] = useState(null);

   useEffect(() => {
      if (template_schema) {
         const treeData = Object.entries(template_schema).map(o => expand(o[0], o[1])).filter(o => o);
         setData(flattenTree({ name: "", children: treeData }));
      }
   }, [template_schema]);

   const formatLabel = (name, type) => type && type !== 'object' ? `${name} (${type})` : name;

   const populateChildren = (entries) => entries.map(s => { return { name: formatLabel(s[0], s[1].type) }; });

   const expand = (name, def) => {
      if (!def) return null;

      if (def.type === 'array') {
         return expand(formatLabel(name, def.type), def.items);
      } else if (def.type === 'object') {
         const res = expand(formatLabel(name, def.type), def.properties);
         const props = Object.entries(def.properties);

         res.children = populateChildren(props);

         //expand nested objects

         props.forEach((prop, index) => {
            const def = prop[1];
            let expanded = null;
            if (def.type === 'array') {
               expanded = expand(prop[0], { type: def.type, items: def.items });
            } else if (def.type === 'object') {
               expanded = expand(prop[0], { type: def.type, properties: def.properties });
            }
            const child = res.children[index];
            if (child && expanded) child.children = expanded.children;
         });

         return res;
      }

      const entries = Object.entries(def);

      if (entries.length === 1) {
         return { name: formatLabel(name, def.type), children: [] };
      }

      return { name, children: populateChildren(entries) };
   }

   return (
      <div className="checkbox">
         {data &&
            <TreeView
               data={data}
               aria-label="Template schema tree"
               nodeRenderer={({
                  element,
                  isBranch,
                  isExpanded,
                  getNodeProps,
                  level,
                  handleExpand,
               }) => {
                  return (
                     <div
                        {...getNodeProps({ onClick: handleExpand })}
                        style={{
                           marginLeft: 40 * (level - 1),
                        }}
                     >
                        {isBranch && <ExpandIndicator isExpanded={isExpanded} />}
                        <span className="name">
                           {element.name}
                        </span>
                     </div>
                  );
               }}
            />
         }
      </div>
   );
}

export default TemplateSchemaTree;