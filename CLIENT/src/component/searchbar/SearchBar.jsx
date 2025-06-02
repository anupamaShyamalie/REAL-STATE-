import { useState } from 'react'
import './searchBar.scss'
import { Search } from 'lucide-react';
import { Link } from 'react-router';

const types = ["Buy", "Rent"];

const SearchBar = () => {

    const [query, setQuery] = useState({

        type: "Buy",
        location: "",
        minprice: 0,
        maxprice: 0

    })

    const swicthType = (val) => {
        setQuery((prev) => ({ ...prev, type: val }))
    }

    return (
        <div className='search'>
            <div className="type">
                {
                    types.map((type) => (
                        <button key={type} onClick={() => swicthType(type)} className={query.type === type ? "active" : ""}>{type}</button>
                    ))
                }

            </div>
            <form action="">
                <input type="text" name="location" id="" placeholder='City location' />
                <input type="number" name="minprice" min={0} max={10000000} id="" placeholder='Min Price ' />
                <input type="number" name="maxprice" min={0} max={10000000} id="" placeholder='Max Price' />
                    <button>
                <Link to={'/list'}>
                        <Search />
                </Link>
                    </button>

            </form>
        </div>
    )
}

export default SearchBar