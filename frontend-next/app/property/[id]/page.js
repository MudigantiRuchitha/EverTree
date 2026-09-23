'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  MapPin,
  PhoneCall,
  MessageSquare,
  Share2,
  FileText,
  Download,
  ArrowLeft,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Heart,
  ShoppingCart,
} from 'lucide-react';

import { propertyAPI } from '../../../services/api';
import MapPicker from '../../../components/MapPicker';
import NearbyPlaces from '../../../components/NearbyPlaces';
import EmiCalculator from '../../../components/EmiCalculator';

import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import { useCart } from '../../../context/CartContext';

export default function PropertyPage({ onOpenChat }) {
  const params = useParams();
  const router = useRouter();

  const { user } = useAuth();
  const { openChat } = useChat();

  const {
    addToCart,
    removeFromCart,
    isInCart,
  } = useCart();

  // Dynamic property ID from /property/[id]
  const propertyId = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [inCart, setInCart] = useState(false);

  // ---------------------------------------------------------
  // LOAD PROPERTY FROM DATABASE
  // ---------------------------------------------------------

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    loadPropertyDetails();
  }, [propertyId]);

  // ---------------------------------------------------------
  // CHECK CART STATUS
  // ---------------------------------------------------------

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    setInCart(isInCart(propertyId));
  }, [propertyId, isInCart]);

  // ---------------------------------------------------------
  // GET PROPERTY DETAILS
  // ---------------------------------------------------------

  const loadPropertyDetails = async () => {
    setLoading(true);

    try {
      const response =
        await propertyAPI.getPropertyById(propertyId);

      const propertyData = response?.data;

      setProperty(propertyData);

      setIsFavorite(
        Boolean(propertyData?.is_favorite)
      );
    } catch (error) {
      console.error(
        'Failed to load property details:',
        error
      );

      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SEND ENQUIRY
  // ---------------------------------------------------------

  const handleSendEnquiry = async (event) => {
    event.preventDefault();

    if (!user) {
      alert('Please login to send an enquiry.');
      return;
    }

    if (!propertyId) {
      return;
    }

    try {
      await propertyAPI.createEnquiry({
        property_id: propertyId,
        message: enquiryMessage,
      });

      setEnquirySent(true);
      setEnquiryMessage('');
    } catch (error) {
      console.error(
        'Enquiry submission failed:',
        error
      );

      alert('Enquiry submission failed.');
    }
  };

  // ---------------------------------------------------------
  // WHATSAPP SHARE
  // ---------------------------------------------------------

  const handleWhatsAppShare = () => {
    if (
      !property ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const url = window.location.href;

    const title =
      property.title || '';

    const price =
      property.price != null
        ? ` for ₹${Number(
            property.price
          ).toLocaleString('en-IN')}`
        : '';

    const location =
      property.city ||
      property.district ||
      property.address ||
      '';

    const locationText =
      location
        ? ` in ${location}`
        : '';

    const text =
      `Property on evertree.in: ${title}` +
      `${price}` +
      `${locationText}` +
      `! Link: ${url}`;

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        text
      )}`,
      '_blank'
    );
  };

  // ---------------------------------------------------------
  // WISHLIST
  // ---------------------------------------------------------

  const handleToggleFavorite = async () => {
    if (!user) {
      alert(
        'Please sign in to add properties to your wishlist.'
      );

      return;
    }

    if (
      favoriteLoading ||
      !propertyId
    ) {
      return;
    }

    setFavoriteLoading(true);

    try {
      const response =
        await propertyAPI.toggleFavorite(
          propertyId
        );

      const favorited =
        Boolean(
          response?.data?.favorited
        );

      setIsFavorite(favorited);
    } catch (error) {
      console.error(
        'Wishlist error:',
        error
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ---------------------------------------------------------
  // CART
  // ---------------------------------------------------------

  const handleToggleCart = () => {
    if (
      !property ||
      !propertyId
    ) {
      return;
    }

    if (inCart) {
      removeFromCart(propertyId);
      setInCart(false);
    } else {
      addToCart({
        ...property,
        id: propertyId,
      });

      setInCart(true);
    }
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">

        <div
          className="
            w-10
            h-10
            border-4
            border-emerald-600
            border-t-transparent
            rounded-full
            animate-spin
            mx-auto
            mb-4
          "
        />

        <p className="font-semibold text-sm">
          Loading verified property details...
        </p>

      </div>
    );
  }

  // ---------------------------------------------------------
  // PROPERTY NOT FOUND
  // ---------------------------------------------------------

  if (!property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">

        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Property not found
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          The property details could not be loaded.
        </p>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="
            inline-flex
            items-center
            gap-2
            px-6
            py-2.5
            rounded-xl
            font-bold
            text-sm
            bg-emerald-600
            text-white
            hover:bg-emerald-700
            shadow-sm
          "
        >
          <ArrowLeft className="w-4 h-4" />

          Back to Search
        </button>

      </div>
    );
  }

  // ---------------------------------------------------------
  // DYNAMIC MEDIA FROM DATABASE
  // ---------------------------------------------------------

  const mediaList =
    Array.isArray(property.media)
      ? property.media.filter(
          (media) =>
            media &&
            media.file_url
        )
      : [];

  const finalMediaList =
    mediaList.length > 0
      ? mediaList
      : property.cover_image
        ? [
            {
              file_url:
                property.cover_image,
              media_type:
                'image',
            },
          ]
        : [];

  const activeMedia =
    finalMediaList[
      selectedMediaIdx
    ] ||
    finalMediaList[0] ||
    null;

  // ---------------------------------------------------------
  // DYNAMIC LOCATION
  // ---------------------------------------------------------

  const propertyLocation =
    property.address ||
    [
      property.city,
      property.district,
    ]
      .filter(Boolean)
      .join(', ');

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div
      className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-6
        sm:py-10
        space-y-8
      "
    >

      {/* ================================================= */}
      {/* BACK BUTTON */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() => router.push('/')}
        className="
          inline-flex
          items-center
          gap-2
          px-4
          py-2
          rounded-xl
          text-sm
          font-semibold
          bg-white
          border
          border-slate-200
          text-slate-700
          hover:bg-slate-100
          shadow-2xs
          transition-all
          cursor-pointer
        "
      >
        <ArrowLeft className="w-4 h-4" />

        Back to Search
      </button>


      {/* ================================================= */}
      {/* TITLE / PRICE */}
      {/* ================================================= */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-end
          justify-between
          gap-4
          pb-6
          border-b
          border-slate-200
        "
      >

        {/* PROPERTY INFORMATION */}

        <div className="space-y-2">

          {/* CATEGORY */}

          <div className="flex flex-wrap gap-2">

            {property.category && (
              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-bold
                  uppercase
                  bg-emerald-100
                  text-emerald-800
                  border
                  border-emerald-200
                "
              >
                {property.category}
              </span>
            )}

            {/* PROPERTY TYPE */}

            {property.property_type && (
              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-bold
                  uppercase
                  bg-blue-100
                  text-blue-800
                  border
                  border-blue-200
                "
              >
                {property.property_type.replace(
                  /_/g,
                  ' '
                )}
              </span>
            )}

            {/* BHK */}

            {property.bhk != null &&
              Number(property.bhk) > 0 && (
                <span
                  className="
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                    uppercase
                    bg-amber-100
                    text-amber-800
                    border
                    border-amber-200
                  "
                >
                  {property.bhk} BHK
                </span>
              )}

            {/* VERIFIED */}

            <span
              className="
                px-3
                py-1
                rounded-full
                text-xs
                font-bold
                bg-emerald-50
                text-emerald-700
                border
                border-emerald-200
                flex
                items-center
                gap-1
              "
            >
              <ShieldCheck className="w-3.5 h-3.5" />

              Legal Verified
            </span>

          </div>


          {/* TITLE */}

          {property.title && (
            <h1
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-black
                text-slate-900
                tracking-tight
              "
            >
              {property.title}
            </h1>
          )}


          {/* LOCATION */}

          {propertyLocation && (
            <div
              className="
                flex
                items-center
                gap-1.5
                text-xs
                sm:text-sm
                text-slate-500
              "
            >
              <MapPin
                className="
                  w-4
                  h-4
                  text-emerald-600
                  shrink-0
                "
              />

              <span>
                {propertyLocation}
              </span>
            </div>
          )}

        </div>


        {/* PRICE */}

        <div
          className="
            text-left
            md:text-right
            shrink-0
          "
        >

          {property.price != null && (
            <div
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-black
                text-emerald-600
              "
            >
              ₹{' '}
              {Number(
                property.price
              ).toLocaleString('en-IN')}

              {property.category ===
                'rent' && (
                <span
                  className="
                    text-xs
                    sm:text-sm
                    text-slate-500
                    font-normal
                  "
                >
                  {' '}
                  / month
                </span>
              )}
            </div>
          )}

          {property.views_count != null && (
            <div
              className="
                flex
                items-center
                md:justify-end
                gap-1
                text-xs
                text-slate-400
                mt-1
              "
            >
              <Eye className="w-3.5 h-3.5" />

              {property.views_count}
              {' '}
              views
            </div>
          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* MAIN GRID */}
      {/* ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
          sm:gap-8
        "
      >

        {/* ================================================= */}
        {/* LEFT CONTENT */}
        {/* ================================================= */}

        <div
          className="
            lg:col-span-2
            space-y-6
          "
        >

          {/* ================================================= */}
          {/* PROPERTY IMAGE */}
          {/* ================================================= */}

          <div
            className="
              bg-slate-900
              rounded-3xl
              overflow-hidden
              shadow-md
              border
              border-slate-200
            "
          >

            <div
              className="
                h-64
                sm:h-96
                md:h-[460px]
                w-full
                flex
                items-center
                justify-center
                bg-black
              "
            >

              {activeMedia ? (

                activeMedia.media_type ===
                'video' ? (

                  <video
                    src={
                      activeMedia.file_url
                    }
                    controls
                    className="
                      w-full
                      h-full
                      object-contain
                    "
                  />

                ) : (

                  <img
                    src={
                      activeMedia.file_url
                    }
                    alt={
                      property.title ||
                      'Property'
                    }
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                )

              ) : (

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    w-full
                    h-full
                    text-slate-400
                    text-sm
                  "
                >
                  No property image available
                </div>

              )}

            </div>

          </div>


          {/* ================================================= */}
          {/* CART + WISHLIST */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
            "
          >

            {/* CART */}

            <button
              type="button"
              onClick={
                handleToggleCart
              }
              className={
                inCart
                  ? `
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3.5
                    px-5
                    rounded-xl
                    font-bold
                    text-sm
                    transition-all
                    border
                    bg-emerald-50
                    text-emerald-700
                    border-emerald-300
                    hover:bg-emerald-100
                  `
                  : `
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3.5
                    px-5
                    rounded-xl
                    font-bold
                    text-sm
                    transition-all
                    border
                    bg-white
                    text-slate-800
                    border-slate-200
                    hover:bg-emerald-50
                    hover:text-emerald-700
                    hover:border-emerald-300
                  `
              }
            >

              <ShoppingCart
                className="w-5 h-5"
              />

              {inCart
                ? 'Remove from Cart'
                : 'Add to Cart'}

            </button>


            {/* WISHLIST */}

            <button
              type="button"
              onClick={
                handleToggleFavorite
              }
              disabled={
                favoriteLoading
              }
              className={
                isFavorite
                  ? `
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3.5
                    px-5
                    rounded-xl
                    font-bold
                    text-sm
                    transition-all
                    border
                    bg-rose-50
                    text-rose-600
                    border-rose-200
                    hover:bg-rose-100
                  `
                  : `
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3.5
                    px-5
                    rounded-xl
                    font-bold
                    text-sm
                    transition-all
                    border
                    bg-white
                    text-slate-800
                    border-slate-200
                    hover:bg-rose-50
                    hover:text-rose-600
                    hover:border-rose-300
                  `
              }
            >

              <Heart
                className={
                  isFavorite
                    ? 'w-5 h-5 fill-rose-500 text-rose-500'
                    : 'w-5 h-5'
                }
              />

              {favoriteLoading
                ? 'Updating...'
                : isFavorite
                  ? 'Remove from Wishlist'
                  : 'Add to Wishlist'}

            </button>

          </div>


          {/* ================================================= */}
          {/* THUMBNAILS */}
          {/* ================================================= */}

          {finalMediaList.length > 1 && (
            <div
              className="
                flex
                gap-3
                overflow-x-auto
                pb-2
                scrollbar-none
              "
            >

              {finalMediaList.map(
                (media, index) => (

                  <button
                    key={
                      media.id ||
                      media.file_url ||
                      index
                    }
                    type="button"
                    onClick={() =>
                      setSelectedMediaIdx(
                        index
                      )
                    }
                    className={
                      selectedMediaIdx ===
                      index
                        ? `
                          w-20
                          h-16
                          sm:w-24
                          sm:h-18
                          rounded-xl
                          overflow-hidden
                          shrink-0
                          transition-all
                          cursor-pointer
                          ring-3
                          ring-emerald-500
                          opacity-100
                          scale-105
                        `
                        : `
                          w-20
                          h-16
                          sm:w-24
                          sm:h-18
                          rounded-xl
                          overflow-hidden
                          shrink-0
                          transition-all
                          cursor-pointer
                          opacity-60
                          hover:opacity-100
                          border
                          border-slate-200
                        `
                    }
                  >

                    {media.media_type ===
                    'video' ? (

                      <video
                        src={
                          media.file_url
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                        muted
                      />

                    ) : (

                      <img
                        src={
                          media.file_url
                        }
                        alt={
                          property.title ||
                          'Property image'
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                    )}

                  </button>

                )
              )}

            </div>
          )}


          {/* ================================================= */}
          {/* PROPERTY DESCRIPTION */}
          {/* ================================================= */}

          {property.description && (
            <div
              className="
                bg-white
                rounded-3xl
                border
                border-slate-200
                p-5
                sm:p-7
                shadow-xs
              "
            >

              <h3
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  mb-3
                "
              >
                Property Overview
              </h3>

              <p
                className="
                  text-sm
                  text-slate-600
                  leading-relaxed
                  whitespace-pre-line
                "
              >
                {property.description}
              </p>

            </div>
          )}


          {/* ================================================= */}
          {/* DOCUMENTS */}
          {/* ================================================= */}

          {Array.isArray(
            property.docs
          ) &&
            property.docs.length > 0 && (

              <div
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-slate-200
                  p-5
                  sm:p-7
                  shadow-xs
                "
              >

                <h3
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                    mb-4
                    flex
                    items-center
                    gap-2
                  "
                >

                  <FileText
                    className="
                      w-5
                      h-5
                      text-amber-600
                    "
                  />

                  Verified Legal Documentation

                </h3>

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                  "
                >

                  {property.docs.map(
                    (doc, index) => (

                      <a
                        key={
                          doc.id ||
                          doc.file_url ||
                          index
                        }
                        href={
                          doc.file_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="
                          flex
                          items-center
                          justify-between
                          p-3.5
                          bg-slate-50
                          hover:bg-emerald-50
                          border
                          border-slate-200
                          hover:border-emerald-300
                          rounded-2xl
                          transition-all
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            truncate
                            text-xs
                            sm:text-sm
                            font-semibold
                            text-slate-800
                          "
                        >

                          <span>
                            📄
                          </span>

                          <span className="truncate">
                            {doc.title ||
                              'Property Document'}
                          </span>

                        </div>

                        <Download
                          className="
                            w-4
                            h-4
                            text-emerald-600
                            shrink-0
                            ml-2
                          "
                        />

                      </a>

                    )
                  )}

                </div>

              </div>

            )}


          {/* ================================================= */}
          {/* NEARBY PLACES */}
          {/* ================================================= */}

          <NearbyPlaces
            amenities={
              property.amenities
            }
          />

        </div>


        {/* ================================================= */}
        {/* RIGHT SIDEBAR */}
        {/* ================================================= */}

        <div
          className="
            lg:sticky
            lg:top-24
            lg:self-start
            space-y-6
            h-fit
          "
        >

          {/* ================================================= */}
          {/* SELLER CARD */}
          {/* ================================================= */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-5
              sm:p-7
              shadow-xs
            "
          >

            {/* SELLER */}

            <div
              className="
                flex
                items-center
                gap-3.5
                pb-5
                mb-5
                border-b
                border-slate-100
              "
            >

              {property.seller_avatar ? (

                <img
                  src={
                    property.seller_avatar
                  }
                  alt={
                    property.seller_name ||
                    'Seller'
                  }
                  className="
                    w-12
                    h-12
                    rounded-full
                    object-cover
                    ring-2
                    ring-emerald-500/30
                  "
                />

              ) : (

                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-slate-100
                    flex
                    items-center
                    justify-center
                    text-slate-400
                    text-sm
                    font-bold
                  "
                >
                  {property.seller_name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    '?'}
                </div>

              )}

              <div>

                {property.seller_name && (
                  <div
                    className="
                      font-bold
                      text-slate-900
                      text-base
                    "
                  >
                    {
                      property.seller_name
                    }
                  </div>
                )}

                {property.seller_role && (
                  <div
                    className="
                      text-xs
                      text-slate-500
                      capitalize
                      flex
                      items-center
                      gap-1
                    "
                  >

                    <CheckCircle2
                      className="
                        w-3.5
                        h-3.5
                        text-emerald-600
                      "
                    />

                    Verified{' '}
                    {
                      property.seller_role
                    }

                  </div>
                )}

              </div>

            </div>


            {/* ================================================= */}
            {/* SELLER ACTIONS */}
            {/* ================================================= */}

            <div
              className="space-y-2.5"
            >

              {/* CHAT */}

              <button
                type="button"
                onClick={() => {

                  if (onOpenChat) {
                    onOpenChat(
                      property
                    );
                  } else {
                    openChat(
                      property
                    );
                  }

                }}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  px-4
                  rounded-xl
                  font-bold
                  text-white
                  bg-emerald-600
                  hover:bg-emerald-700
                  shadow-md
                  shadow-emerald-600/20
                  transition-all
                  cursor-pointer
                "
              >

                <MessageSquare
                  className="w-4 h-4"
                />

                Live Chat with Owner

              </button>


              {/* CALL */}

              {property.seller_phone && (
                <a
                  href={`tel:${property.seller_phone}`}
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3
                    px-4
                    rounded-xl
                    font-bold
                    text-slate-800
                    bg-slate-100
                    hover:bg-slate-200
                    border
                    border-slate-200
                    transition-all
                  "
                >

                  <PhoneCall
                    className="
                      w-4
                      h-4
                      text-amber-600
                    "
                  />

                  Call (
                  {
                    property.seller_phone
                  }
                  )

                </a>
              )}


              {/* WHATSAPP */}

              <button
                type="button"
                onClick={
                  handleWhatsAppShare
                }
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  px-4
                  rounded-xl
                  font-bold
                  text-white
                  bg-emerald-500
                  hover:bg-emerald-600
                  shadow-sm
                  transition-all
                  cursor-pointer
                "
              >

                <Share2
                  className="w-4 h-4"
                />

                Share on WhatsApp

              </button>

            </div>


            {/* ================================================= */}
            {/* ENQUIRY */}
            {/* ================================================= */}

            <form
              onSubmit={
                handleSendEnquiry
              }
              className="
                mt-6
                pt-5
                border-t
                border-slate-100
                space-y-3
              "
            >

              <div className="space-y-1">

                <label
                  className="
                    text-xs
                    font-bold
                    text-slate-700
                    uppercase
                  "
                >
                  Direct Enquiry Message
                </label>

                <textarea
                  rows={2}
                  placeholder="I am interested in this property..."
                  value={
                    enquiryMessage
                  }
                  onChange={(event) =>
                    setEnquiryMessage(
                      event.target.value
                    )
                  }
                  required
                  className="
                    w-full
                    px-3
                    py-2
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-xl
                    text-xs
                    text-slate-900
                    focus:bg-white
                    focus:outline-hidden
                    focus:ring-2
                    focus:ring-emerald-500
                  "
                />

              </div>


              <button
                type="submit"
                className="
                  w-full
                  py-2.5
                  rounded-xl
                  font-bold
                  text-xs
                  text-slate-800
                  bg-slate-100
                  hover:bg-slate-200
                  border
                  border-slate-200
                  cursor-pointer
                "
              >
                Send Quick Enquiry
              </button>


              {enquirySent && (
                <div
                  className="
                    text-xs
                    text-emerald-600
                    font-bold
                    text-center
                  "
                >
                  ✓ Enquiry sent to seller!
                </div>
              )}

            </form>

          </div>


          {/* ================================================= */}
          {/* MAP */}
          {/* ================================================= */}

          {property.latitude != null &&
            property.longitude != null && (

              <MapPicker
                lat={
                  property.latitude
                }
                lng={
                  property.longitude
                }
                isEditable={false}
              />

            )}

        </div>

      </div>


      {/* ================================================= */}
      {/* EMI CALCULATOR */}
      {/* ================================================= */}

      {property.price != null && (
        <div className="pt-4">

          <EmiCalculator
            defaultPrincipal={
              property.price
            }
          />

        </div>
      )}

    </div>
  );
}