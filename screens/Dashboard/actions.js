import constants from './constants';

// Actions
export default {

	test: (data) => {

		// console.log('action called, now go to reducer');
		return {
			type: 'message',
			data: data
		}
	},


}