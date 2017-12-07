import React from 'react';

const RawHTML = ({children, className = ""}) =>
    <span className={className}
          dangerouslySetInnerHTML={{ __html: children.replace(/\n/g, '<br />')}} />

export default RawHTML;