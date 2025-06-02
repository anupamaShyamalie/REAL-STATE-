
import { Search } from 'lucide-react'
import './filter.scss'


const Filter = () => {
  return (
    <div className='filter'>
      <h1>Search results for <b>Galle</b></h1>
      <div className="top">
        <div className="item">
          <label htmlFor="city">City</label>
          <input type="text" placeholder='City location' id='city' name='city' />
        </div>
      </div>
      <div className="bottom">
      <div className="item">
          <label htmlFor="type">Type</label>
          <select name="type" id="type">
            <option value="">Any</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </div>
        <div className="item">
          <label htmlFor="property">Property</label>
          <select name="property" id="property">
            <option value="">Any</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
          </select>
        </div>
        <div className="item">
          <label htmlFor="minprice">Min Price</label>
          <input type="number" placeholder='Any' id='minprice' name='minprice' />
        </div>
        <div className="item">
          <label htmlFor="maxprice">Max Price</label>
          <input type="number" placeholder='Any' id='maxprice' name='maxprice' />
        </div>
        <div className="item">
          <label htmlFor="bedroom">Bedroom</label>
          <input type="text" placeholder='Any' id='bedroom' name='bedroom' />
        </div>
        <div className="search">
        <button>
        <Search className='icon' />
        </button>
        </div>
       
      </div>
    </div>
  )
}

export default Filter