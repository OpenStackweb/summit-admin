import React from 'react';
import Table from './Table';
import TableColumn from './TableColumn';

class DataTable extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: this.props.data,
			options: this.props.options
		};
		this.handleSort = this.handleSort.bind(this);
	}

    componentWillReceiveProps(nextProps) {
        if (this.state.data.length != nextProps.data.length) {
            this.setState({
                data: nextProps.data
            });
        }
    }

	handleSort (index, key, dir, func) {
		if(!func) return;

        let options = this.state.options;
        options.sortCol = key || index;
        options.sortDir = dir;

		this.setState({
			options: options,
			data: this.state.data.sort((a,b) => {
				return this.state.options.sortDir == 1 ?
					func(a[options.sortCol], b[options.sortCol]) :
					func(b[options.sortCol], a[options.sortCol])
			})
		});
	}

	render() {
		return (
            <Table
                options={this.state.options}
                data={this.state.data}
                columns={this.props.columns}
                onSort={this.handleSort}
                className="dataTable"
            />
		);
	}
}

export default DataTable;