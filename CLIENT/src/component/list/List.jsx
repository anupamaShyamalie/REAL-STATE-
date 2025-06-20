import { listData } from '../../lib/dummydata'
import './list.scss'
import Card from "../card/Card"

const List = () => {
  return (
    <div className='list'>
        {listData.map(item=>(
            <Card key={item.id} item={item}/>
        ))}
    </div>
  )
}

export default List