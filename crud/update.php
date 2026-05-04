<?php
include 'koneksi.php';

$id = $_GET['id'];
$data = mysqli_query($conn, "SELECT * FROM barang WHERE id=$id");
$row = mysqli_fetch_assoc($data);
?>

<form method="POST">
<input type="text" name="nama" value="<?= $row['nama_barang']; ?>"><br>
<input type="text" name="kategori" value="<?= $row['kategori']; ?>"><br>
<input type="number" name="harga" value="<?= $row['harga']; ?>"><br>

<button name="update">Update</button>
</form>

<?php
if (isset($_POST['update'])) {
    mysqli_query($conn, "UPDATE barang SET 
        nama_barang='$_POST[nama]',
        kategori='$_POST[kategori]',
        harga='$_POST[harga]'
        WHERE id=$id");

    header("Location: index.php");
}
?>