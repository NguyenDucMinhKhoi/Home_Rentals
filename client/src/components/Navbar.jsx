import { IconButton } from '@mui/material'
import { Search, Person, Menu } from '@mui/icons-material'
import variables from '../styles/variables.scss'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../styles/Navbar.scss'
import { Link, useNavigate } from 'react-router-dom'
import { setLogout } from '../redux/state'

const Navbar = () => {
    const [dropdownMenu, setDropdownMenu] = useState(false)
    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()
    //const navigate =useNavigate()

    return (
        <div className='navbar'>
            <a href="/">
                <img src="/assets/logo.png" alt="logo" />
            </a>
            <div className='navbar_search'>
                <input type="text" placeholder='Search ...' />
                <IconButton>
                    <Search 
                    sx={{ color: variables.pinked }} 
                    //onClick={() => {navigate(`/properties/search/${search}`)}}
                    />
                </IconButton>
            </div>

            <div className='navbar_right'>
                {user ? (
                    <a href='/create-listing' className='host'>Become A Host</a>
                ) : (
                    <a href='/login' className='host'>Become A Host</a>
                )}

                <button
                    className='navbar_right_account'
                    onClick={() => setDropdownMenu(true)}
                >
                    <Menu sx={{ color: variables.dakgray }} />
                    {!user ?
                        <Person sx={{ color: variables.dakgray }} />
                        : (
                            <img
                                src={`http://localhost:3001/${user.profileImagePath.replace("public", "")}`}
                                alt='profile photo'
                                style={{ objectFit: "cover", borderRadius: "50%" }}
                            />
                        )
                    }
                </button>

                {dropdownMenu && !user && (
                    <div className='navbar_right_accountmenu'>
                        <Link to="/login">Log In</Link>
                        <Link to="/register">Sign In</Link>
                    </div>
                )}

                {dropdownMenu && user && (
                    <div className='navbar_right_accountmenu'>
                        <Link to=''>Trip List</Link>
                        <Link to=''>Wish List</Link>
                        <Link to=''>Reservation List</Link>
                        <Link to=''>Become A Host</Link>

                        <Link to='/login' onClick={() => {
                            dispatch(setLogout())
                        }}>Log Out</Link>
                    </div>
                )}
            </div>
        </div>


    )
}

export default Navbar