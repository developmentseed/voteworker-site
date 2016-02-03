'use strict';

import React from 'react';
import Box from '../components/box';

let Empty = React.createClass({
  displayName: '404 empty',

  render: function () {
    return (
      <Box>
        <div className='error-text'>      	
        	<div className='error-number'>404</div>
					This is not the webpage you are looking for!</div>
      </Box>
    );
  }
});

export default Empty;
