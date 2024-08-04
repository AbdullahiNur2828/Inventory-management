'use client'
import { Box, Button, Modal, Stack, TextField, Typography, Slide, Autocomplete } from "@mui/material";

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, deleteDoc } from "firebase/firestore";
import { ST } from "next/dist/shared/lib/utils";
//const item = ["tomato", "patato", "garlic", "ginger", "carrot", "lettuce"]
export default function Home() {
  const [inventory, setInventory] = useState([])  // State for storing inventory items, initially an empty array
  const [open, setOpen] = useState(false)       // State for tracking open/closed status, initially false
  const [itemName, setItemName] = useState([''])  // State for storing an item name, initially an empty string
  const [searchOpen, setSearchOpen] = useState(false);  // State for tracking search panel open/closed status
  const [searchQuery, setSearchQuery] = useState('');  // State for storing the search query  
  const [foodItems, setFoodItems] = useState([]);  // State for storing food items with images

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

  useEffect(()=>{
    updateInventory()

  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleSearchOpen = () => setSearchOpen(true);
  const handleSearchClose = () => setSearchOpen(false);
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  return(
    <Box
      width="100vw" 
      height="100vh"
      display={"flex"}
      flexDirection="column"
      justifyContent={"center"}
      alignItems={"center"}
      gap={2}
    >
      {/* Modal is a component that creates a dialog box or overlay that appears on top of the current content. 
      It’s used to display content in a focused and interactive way, often for tasks like: showing Alerts or Confirmations:*/}
      {/* <Modal
        open = {open}
        onClose={handleClose}>
          <Box
          position='absolute' top="50%" left='50%'
          // transform='translate(-50%,-50%)'   this didnt work, variable not supported use sx
          width={400}
          bgcolor="white"
          border="2xp solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)'
          }}

          >
            <Typography variant = "h6" color="black">Add Item</Typography>
            <Stack width="100%" direction = "row" spacing={2}>
              <TextField
              variant="outlined"
              fullWidth
              valie = {itemName}
              onChange={(e)=>{
                setItemName(e.target.value)
              }}

              />
              <Button variant="outlined" onClick={()=> {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}>add</Button>

            </Stack>
          </Box>

      </Modal> */}
       {/* Search Bar */}
      <TextField
        variant="outlined"
        placeholder="Search items..."
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" color="secondary" onClick={handleSearchOpen}>
        Add/Search Items
      </Button>

      <Slide direction="up" in={searchOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            bgcolor: 'background.paper',
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
            addItem(itemName);
            setItemName('');
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
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  setSearchQuery(e.target.value); // Update searchQuery to filter items
                }}
              />
            )}
          />

        </Box>
      </Slide>


      <Button variant="contained" onClick={()=>{
        handleOpen()
      }}>
        Add New Item
      </Button>
      <Box border='1px solid #333'>
        <Box 
          width="800px" 
          height= "100px" 
          bgcolor="#ADD8E6" 
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
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between" //instead of having Boxes1 we have= Boxes   1 so quantity is on far right
            bgcolor="#f0f0f0"
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