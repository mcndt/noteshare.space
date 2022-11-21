import { crc16 as crc } from "crc";

/**
 * @param id {string} a 16 character base16 string with 12 random characters and 4 CRC characters
 * @returns {boolean} true if the id is valid, false otherwise
 */
export default function checkId(id: string): boolean {
  // check length
  if (id.length !== 16) {
    return false;
  }
  // extract the random number and the checksum
  const random = id.slice(0, 12);
  const checksum = id.slice(12, 16);

  // compute the CRC of the random number
  const computedChecksum = crc(random).toString(16).padStart(4, "0");

  // compare the computed checksum with the one in the id
  return computedChecksum === checksum;
}
