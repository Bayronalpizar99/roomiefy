import React from "react";
import * as Avatar from "@radix-ui/react-avatar";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Star, MapPin, Home, DollarSign, Verified } from "lucide-react";
import './RoomieCard.css';
import { Link } from "react-router-dom";

// Importa los componentes de Radix Themes
import {
  Card,
  Flex,
  Text,
  Badge,
  Box,
  Heading,
} from "@radix-ui/themes";

export default function RoommateCard({ roommate = {}, onClick = () => {}, view = 'grid' }) {
  const isListView = view === 'list';
  
  return (
    <Tooltip.Provider>
      <Link to={`/roomie/${roommate.id}`} state={{ roommate: roommate }} className={`property-card-link ${view === 'list' ? 'list-view-card' : ''}`}>
        <div className="property-card">
          <Flex 
            direction={isListView ? 'row' : 'column'} 
            gap={isListView ? '4' : '3'}
            className={`property-card-body ${isListView ? 'list-layout' : 'grid-layout'}`}
            style={{
              flexWrap: isListView ? 'nowrap' : 'wrap',
              alignItems: isListView ? 'flex-start' : 'stretch'
            }}
          >
            <Flex direction={view === 'list' ? 'column' : 'row'} gap="2" className="property-card-header">
              {/* Avatar con verificación */}
              <Box position="relative" className="avatar-wrap">
                <Avatar.Root className="avatar">
                  <Avatar.Image
                    src={roommate?.avatar || ""}
                    alt={roommate?.name || "Usuario"}
                    className="avatar-img"
                  />
                  <Avatar.Fallback className="avatar-fallback">
                    {roommate?.name?.charAt(0) || "?"}
                  </Avatar.Fallback>
                </Avatar.Root>
                {roommate?.verified && (
                  <div className="verified-badge">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Verified className="verified-icon" />
                      </Tooltip.Trigger>
                      <Tooltip.Content className="tooltip">
                        <Text>Perfil verificado</Text>
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </div>
                )}
              </Box>

              <Box className="property-card-info">  
                {/* Nombre y edad */}
                <Flex align="center" gap="2" className="name-age">
                  <Heading as="h3" size="3">
                    {roommate?.name || "Desconocido"}
                  </Heading>
                  <Text size="2" color="gray">
                    {roommate?.age || "--"} años
                  </Text>
                </Flex>

                {/* Rating */}
                <Flex align="center" gap="1" className="rating-row">
                  <Star className="h-4 w-4 rating-star" color="var(--color-primary)" fill="var(--color-primary)" />
                  <Text size="2" weight="medium">
                    {roommate?.rating || "0"}
                  </Text>
                  <Text size="1" color="gray">
                    ({roommate?.reviews || "0"})
                  </Text>
                </Flex>
              </Box>
            </Flex>

            {/* Contenido principal (derecha en vista lista) */}
            <Flex direction="column" gap="2" className="property-info">


              {/* Ubicación */}
              <Flex align="center" gap="1">
                <MapPin className="h-4 w-4" />
                <Text size="2" color="gray">
                  {roommate?.location || "Sin ubicación"}
                </Text>
              </Flex>

              {/* Estado apartamento */}
              <Badge
                variant="soft"
                radius="large"
                color={roommate?.hasApartment ? 'purple' : 'gray'}
              >
                <Flex gap="1" align="center">
                  <Home className="h-3 w-3" />
                  <Text size="1">{roommate?.hasApartment ? 'Tiene apartamento' : 'No tiene apartamento'}</Text>
                </Flex>
              </Badge>

              {/* Presupuesto */}
              <Flex align="center" gap="1">
                <DollarSign className="h-4 w-4" color="var(--color-text-primary)" />
                <Text size="2">
                  ${roommate?.budget?.min || 0} - ${roommate?.budget?.max || 0}
                </Text>
              </Flex>

              {/* Bio */}
              <Text size="2" color="gray">
                {roommate?.bio || "Sin descripción"}
              </Text>

              {/* Intereses */}
              <Flex gap="1" wrap="wrap">
                {(view === 'list' ? roommate?.interests : roommate?.interests?.slice(0, 3))?.map((interest) => (
                  <Badge key={interest} variant="soft" radius="full" color="purple">
                    <Text size="1">{interest}</Text>
                  </Badge>
                ))}
                {view !== 'list' && roommate?.interests?.length > 3 && (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Badge 
                        variant="soft" 
                        radius="full" 
                        color="purple"
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          ':hover': { opacity: 0.9 }
                        }}
                      >
                        <Text size="1" weight="medium">+{roommate.interests.length - 3} más</Text>
                      </Badge>
                    </Tooltip.Trigger>
                    <Tooltip.Content 
                      side="top" 
                      sideOffset={5}
                      avoidCollisions={true}
                      collisionPadding={16}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid var(--gray-5)',
                        maxWidth: '250px',
                        zIndex: 1000,
                        // Asegurar que el tooltip no se salga de la pantalla
                        position: 'relative',
                        '--tooltip-arrow-size': '8px',
                        '--tooltip-arrow-offset': 'calc(var(--tooltip-arrow-size) / 2)'
                      }}
                    >
                      <Text size="2" mb="2" weight="semibold" style={{ color: 'var(--purple-11)' }}>
                        Otros intereses
                      </Text>
                      <Flex gap="1" wrap="wrap">
                        {roommate.interests.slice(3).map((interest) => (
                          <Badge 
                            key={interest} 
                            variant="soft" 
                            radius="full"
                            color="purple"
                            style={{ marginBottom: '4px' }}
                          >
                            <Text size="1">{interest}</Text>
                          </Badge>
                        ))}
                      </Flex>
                    </Tooltip.Content>
                  </Tooltip.Root>
                )}
              </Flex>
            </Flex>
          </Flex>
        </div>
      </Link>
    </Tooltip.Provider>
  );
}