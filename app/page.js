'use client'
import { Box, Button, Modal, Stack, TextField, Typography, Slide, Autocomplete } from "@mui/material";


import { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import from firebase/auth
import { auth } from './firebase'; // Ensure correct import of auth
import { signOut, useSession } from "firebase/auth"; //idk if i should use this or "next-auth/react"
//const item = ["tomato", "patato", "garlic", "ginger", "carrot", "lettuce"]
export default function Home() {
  const [inventory, setInventory] = useState([])  // State for storing inventory items, initially an empty array
  const [open, setOpen] = useState(false)       // State for tracking open/closed status, initially false
  const [itemName, setItemName] = useState([''])  // State for storing an item name, initially an empty string
  const [searchOpen, setSearchOpen] = useState(false);  // State for tracking search panel open/closed status
  const [searchQuery, setSearchQuery] = useState('');  // State for storing the search query  
  const [newItemName, setNewItemName] = useState('');  

  const [foodItems, setFoodItems] = useState([]);  // State for storing food items with images
  const [user, setUser] = useState(null);  // State for storing the authenticated user

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await fetch('https://world.openfoodfacts.org/cgi/search.pl?search_terms=&search_simple=1&action=process&json=1');
        if(!response.ok){
          throw new Error (`return status ${response.status}`);
        }
        let items = await response.json();
        items = items.products.map(product => ({
          name: product.product_name,
          image: product.image_url
        }));
        setFoodItems(items);
      } catch (error) {
        console.error("Error fetching food items:", error);
      }
    };

    fetchFoodItems();
  }, []);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore,'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })

    })
    setInventory(inventoryList)
    console.log(inventoryList)
  }

  const addItem = async (item)=>{
    const docRef = doc(collection(firestore,'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }
    else{
      await setDoc(docRef, {quantity: 1})
    }
    
    await updateInventory()
  }

  const removeItem = async (item)=>{
    const docRef = doc(collection(firestore,'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity == 1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleSearchOpen = () => setSearchOpen(true);
  const handleSearchClose = () => setSearchOpen(false);
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };


  return(
    <Box
      
      bgcolor="#e3faea"
      width="100vw" 
      height="100vh"
      display={"flex"}
      flexDirection="column"
      justifyContent="center"
      alignItems={"center"}
      gap={2}
    >
      {user ? (
        <>
          <Typography variant="h3">Welcome, {user.displayName}</Typography>
          <Button variant="contained"  onClick={handleSignOut}>
            Sign Out
          </Button>
        </>
      ) : (
        <Button variant="contained" onClick={signInWithGoogle}>
          Sign in with Google
        </Button>
      )}

      {user && (
        <>
       {/* Search Bar */}
      

      <Button variant="contained" color="secondary" onClick={handleSearchOpen}>
        Add/Search Items
      </Button>

      <Slide direction="right" in={searchOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '25%',
            height: '100%',
            bgcolor: '#ddf0e2',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            transform: 'translate(-50%, -50%)',
            zIndex: 1300, // Make sure it's above other content
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add/Search Items</Typography>
            <Button variant="outlined" onClick={()=> {
                handleSearchClose()
              }}>Close</Button>
          
          </Box>

          {/* <TextField
            variant="outlined"
            fullWidth
            placeholder="Enter item name to add..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          /> */}
          <Button variant="contained" onClick={() => {
            addItem(newItemName);
            setNewItemName('');
          }}>
            Add Item
          </Button>

          <Autocomplete
            freeSolo
            options={foodItems.map(item => item.name)}
            inputValue={searchQuery}
            onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                placeholder="Enter item name to add..."
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  setSearchQuery(e.target.value); // Update searchQuery to filter items
                }}
              />
            )}
          />

        </Box>
      </Slide>
      

      
      <Box border='1px solid #333' sx={{ borderRadius: '16px' }}>
      <TextField
        variant="filled"
        color="secondary"
        bgcolor = "#000"
        placeholder="Search items..."
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
        <Box 
          width="800px" 
          height= "100px" 
          bgcolor="#5ba670" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <Typography variant="h2" color="#333">Inventory Items</Typography>
        </Box>
        
      
      <Stack
        width="800px"
        height="300px"
        spacing={2}
        overflow="auto"      
      >
        
        {
          filteredInventory.map(({name, quantity})=>(
            <Box key={name} width="100%"
            sx={{ borderRadius: '16px' }}
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between" //instead of having Boxes1 we have= Boxes   1 so quantity is on far right
            bgcolor="#a7c4af"
            padding={5}
            >
              <Typography variant="h3" color='#333' textAlign='center'
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color='#333' textAlign='center'
              >
                {quantity}
              </Typography>
              <Button variant="contained" onClick={()=>{
                removeItem(name)
              }}>
                Remove 
              </Button>
            </Box>
          ))
        }

      </Stack>
      </Box>
      </>
     )}
    </Box>
  );
}


// return <Box
// width="100vw" height="100vh"
// display={"flex"}
// justifyContent={"center"}
// alignItems={"center"}
// >
//   <Stack width="800px" height="200px" spacing={2} overflow={"scroll"}
//   >
//     {item.map((i) => (
//       <Box 
//         key = {i}
//         height="100%"
//         display={"flex"}
//         justifyContent={"center"}
//         alignItems={"center"}
//         bgcolor={"#f0f0f0"}
//       >
//         {i}
//       </Box>
//     ))}
//   </Stack>
// </Box>